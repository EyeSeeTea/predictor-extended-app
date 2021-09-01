import _ from "lodash";
import { UseCase } from "../../compositionRoot";
import i18n from "../../locales";
import { promiseMap } from "../../utils/promises";
import { generateUid } from "../../utils/uid";
import { getTemplates, interpolate } from "../../utils/uid-replacement";
import { ExcelCell, ExcelModel, getColumn, getRow } from "../entities/Excel";
import { defaultPredictor, PredictorDetails } from "../entities/Predictor";
import { Validation } from "../entities/Validation";
import { ExcelRepository } from "../repositories/ExcelRepository";
import { MetadataRepository } from "../repositories/MetadataRepository";

export class ReadPredictorsExcelUseCase implements UseCase {
    constructor(private excelRepository: ExcelRepository, private metadataRepository: MetadataRepository) {}

    public async execute(files: File[]): Promise<ImportResult> {
        const excelPredictors = await promiseMap(files, async file => {
            const buffer = await file.arrayBuffer();
            const excelFile = await this.excelRepository.readFile(buffer);
            return this.buildPredictors(excelFile);
        });

        return {
            predictors: _.flatMap(excelPredictors, ({ predictors }) => predictors),
            warnings: _.flatMap(excelPredictors, ({ warnings }) => warnings ?? []),
        };
    }

    public async buildPredictors(excelFile: ExcelModel): Promise<ImportResult> {
        const sheet = excelFile.sheets["Predictors"];
        if (!sheet) throw new Error("Invalid excel file");

        const { cells } = sheet;
        const columns = this.buildColumns(cells);

        const entries = _(cells)
            .groupBy(item => getRow(item.ref))
            .omitBy((_value, key) => parseInt(key) === 0)
            .values()
            .map(cells => {
                const pairs = _.compact(
                    cells?.map(cell => {
                        const column = columns[getColumn(cell.ref)];
                        return column ? [String(column).replace(/^_/, ""), String(cell.contents.value)] : undefined;
                    })
                );

                return [_.compact(pairs.map(item => item[0])), _.compact(pairs.map(item => item[1]))];
            })
            .map(([keys, values]) => _.zipObjectDeep(keys, values) as Record<string, string>)
            .value();

        const { dictionary, warnings: dictionaryWarnings } = await this.buildDictionary(entries);
        const predictors = await this.cleanPredictors(entries, dictionary);
        const warnings = dictionaryWarnings;

        return { predictors, warnings };
    }

    private buildColumns(cells: ExcelCell[]) {
        return _(cells)
            .filter(item => getRow(item.ref) === 0)
            .map(item => [getColumn(item.ref), String(item.contents.value)])
            .fromPairs()
            .value();
    }

    private async buildDictionary(entries: Record<string, any>[]) {
        const newPredictors = _.flatMap(entries, ({ id, name, code }) => [
            [name, id],
            [code, id],
        ]);

        const templates = _(entries)
            .flatMap(({ generator, sampleSkipTest }) => [generator?.expression, sampleSkipTest?.expression])
            .compact()
            .flatMap(formula => getTemplates(formula))
            .value();

        const metadata = await this.metadataRepository.lookup(templates).toPromise();
        const validMetadata = _.pickBy(metadata, (_value, key) =>
            ["dataElements", "categoryOptionCombos"].includes(key)
        );

        const dictionary = _(validMetadata)
            .values()
            .flatten()
            .flatMap(({ id, name, shortName, code }) => [
                [name, id],
                [code, id],
                [shortName, id],
            ])
            .union(newPredictors)
            .uniqBy(([key]) => key)
            .filter(([key]) => key !== undefined)
            .fromPairs()
            .value();

        const warnings: Validation<"UNKNOWN_REF">[] = _(templates)
            .difference(_.keys(dictionary))
            .map(template => ({
                id: template,
                error: "UNKNOWN_REF" as const,
                description: i18n.t("Reference {{template}} was not found on this instance", {
                    template,
                }),
            }))
            .value();

        return { dictionary, warnings };
    }

    private async cleanPredictors(
        entries: Record<string, any>[],
        dictionary: Record<string, string>
    ): Promise<Partial<PredictorDetails>[]> {
        return promiseMap(entries, async object => {
            const output = await this.metadataRepository.search("dataElements", object.output ?? "");

            const outputCombo = await this.metadataRepository.search("categoryOptionCombos", object.outputCombo ?? "");

            const predictorGroups = _.compact(
                await promiseMap(object.predictorGroups?.split(",") ?? [], (group: string) =>
                    this.metadataRepository.search("predictorGroups", group)
                )
            );

            const organisationUnitLevels = _.compact(
                await promiseMap(object.organisationUnitLevels?.split(",") ?? [], (level: string) =>
                    this.metadataRepository.search("organisationUnitLevels", level)
                )
            );

            return {
                ...defaultPredictor,
                ...object,
                id: object.id ?? generateUid(),
                output,
                outputCombo,
                predictorGroups,
                organisationUnitLevels,
                generator: {
                    ...object.generator,
                    expression: interpolate(object.generator?.expression ?? "", dictionary),
                },
                sampleSkipTest: object.sampleSkipTest
                    ? {
                          ...object.sampleSkipTest,
                          expression: interpolate(object.sampleSkipTest?.expression ?? "", dictionary),
                      }
                    : undefined,
            };
        });
    }
}

export interface ImportResult {
    predictors: Partial<PredictorDetails>[];
    warnings?: Validation<"UNKNOWN_COLUMN" | "UNKNOWN_REF" | "PARSE_ERROR">[];
}
