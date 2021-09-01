import _ from "lodash";
import { UseCase } from "../../compositionRoot";
import { getTemplates, interpolate } from "../../utils/uid-replacement";
import { getPredictorName, PredictorFormField } from "../../webapp/components/predictor-form/PredictorForm";
import { ExcelCell, ExcelModel } from "../entities/Excel";
import { PredictorDetails } from "../entities/Predictor";
import { ExcelRepository } from "../repositories/ExcelRepository";
import { FileRepository } from "../repositories/FileRepository";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { PredictorRepository } from "../repositories/PredictorRepository";

export class ExportPredictorsUseCase implements UseCase {
    constructor(
        private predictorRepository: PredictorRepository,
        private excelRepository: ExcelRepository,
        private fileRepository: FileRepository,
        private metadataRepository: MetadataRepository
    ) {}

    public async execute(ids: string[]) {
        const emptyFile = await this.excelRepository.createFile();
        const predictors = await this.predictorRepository.get(ids).toPromise();

        const templates = _(predictors)
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
            .flatMap(({ id, name, shortName, code }) => [[id, code ?? shortName ?? name ?? id]])
            .fromPairs()
            .value();

        const definedNames = _(exportFields)
            .map((field, index) => [
                field,
                {
                    ref: {
                        type: "cell" as const,
                        sheet: "Metadata",
                        address: { row: index + 1, column: 0 },
                    },
                    contents: { type: "text" as const, value: getPredictorName(field) },
                },
            ])
            .fromPairs()
            .value();

        const cells: ExcelCell[] = [
            ...exportFields.map((field: string, index: number) => ({
                ref: {
                    type: "cell" as const,
                    sheet: "Predictors",
                    address: { row: 0, column: index },
                },
                contents: { type: "formula" as const, value: field },
            })),
            ..._.flatMap(predictors, (predictor: PredictorDetails, row: number) =>
                exportFields.map((key: PredictorFormField, column: number) => ({
                    ref: {
                        type: "cell" as const,
                        sheet: "Predictors",
                        address: { row: row + 1, column },
                    },
                    contents: { type: "text" as const, value: formatValue(predictor, key, dictionary) ?? "" },
                }))
            ),
        ];

        const file: ExcelModel = {
            definedNames,
            sheets: {
                Predictors: { cells },
                Metadata: { cells: _.toPairs(definedNames).map(([_key, value]) => value) },
            },
        };

        const buffer = await this.excelRepository.writeFile(emptyFile, file);
        this.fileRepository.download({ type: "excel", name: "Test", buffer });
    }
}

const formatValue = (
    predictor: PredictorDetails,
    key: PredictorFormField,
    dictionary: Record<string, string>
): string | number => {
    const value = _.get(predictor, key);
    if (!value) return "";

    switch (key) {
        case "output":
        case "outputCombo":
            return predictor[key]?.name ?? "";
        case "predictorGroups":
        case "organisationUnitLevels":
            return predictor[key]?.map(({ name }) => name).join(",") ?? "";
        case "generator.expression":
        case "sampleSkipTest.expression":
            return interpolate(value, dictionary);
    }

    if (typeof value === "string" || typeof value === "number") return value;

    return "";
};

export const exportFields = [
    "id",
    "code",
    "name",
    "description",
    "output",
    "outputCombo",
    "periodType",
    "annualSampleCount",
    "sequentialSampleCount",
    "organisationUnitLevels",
    "predictorGroups",
    "sequentialSkipCount",
    "generator.description",
    "generator.expression",
    "generator.missingValueStrategy",
    "sampleSkipTest.description",
    "sampleSkipTest.expression",
    "scheduling.sequence",
    "scheduling.variable",
];
