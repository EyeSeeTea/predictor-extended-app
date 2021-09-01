import _ from "lodash";
import { FormulaVariable } from "../domain/entities/FormulaVariable";
import { FutureData } from "../domain/entities/Future";
import { FormulaVariableRepository } from "../domain/repositories/FormulaVariableRepository";
import i18n from "../locales";
import { D2Api } from "../types/d2-api";
import { getD2APiFromUrl } from "./utils/d2-api";
import { toFuture } from "./utils/futures";

export class FormulaVariableD2ApiRepository implements FormulaVariableRepository {
    private api: D2Api;

    constructor(baseUrl: string) {
        this.api = getD2APiFromUrl(baseUrl);
    }

    public get(): FutureData<FormulaVariable[]> {
        return toFuture(
            this.api.metadata.get({
                dataElements: {
                    fields: {
                        ...baseFields,
                        aggregationType: true,
                        domainType: true,
                        valueType: true,
                        zeroIsSignificant: true,
                        categoryCombo: {
                            name: true,
                            categoryOptionCombos: { id: true, name: true, description: true },
                        },
                    },
                },
                constants: {
                    fields: {
                        ...baseFields,
                        value: true,
                    },
                },
                organisationUnitGroups: {
                    fields: baseFields,
                },
                predictors: {
                    fields: { ...baseFields, output: { id: true, name: true }, outputCombo: { id: true, name: true } },
                },
            })
        ).map(({ dataElements = [], constants = [], organisationUnitGroups = [], predictors = [] }) => {
            const dataElementVariables = dataElements.map(({ id, name, description, categoryCombo, ...rest }) => ({
                id,
                label: name,
                filterText: name,
                insertText: id,
                description,
                type: "dataElements",
                options: categoryCombo.categoryOptionCombos.map(({ id, name, description }) => ({
                    id,
                    label: name,
                    filterText: name,
                    insertText: id,
                    description,
                    type: "categoryOptionCombos",
                })),
                properties: _(rest)
                    .mapValues((value, key) => ({
                        property: key,
                        label: buildLabel(key),
                        value: buildValue(value),
                    }))
                    .values()
                    .value(),
            }));

            const constantVariables = constants.map(({ id, name, description, ...rest }) => ({
                id,
                label: name,
                filterText: name,
                insertText: id,
                description,
                type: "constants",
                properties: _(rest)
                    .mapValues((value, key) => ({
                        property: key,
                        label: buildLabel(key),
                        value: buildValue(value),
                    }))
                    .values()
                    .value(),
            }));

            const orgUnitGroupVariables = organisationUnitGroups.map(({ id, name, description, ...rest }) => ({
                id,
                label: name,
                filterText: name,
                insertText: id,
                description,
                type: "organisationUnitGroups",
                properties: _(rest)
                    .mapValues((value, key) => ({
                        property: key,
                        label: buildLabel(key),
                        value: buildValue(value),
                    }))
                    .values()
                    .value(),
            }));

            const predictorVariables = predictors.map(({ id, name, description, output, outputCombo }) => ({
                id,
                label: name,
                filterText: name,
                insertText: _.compact([output.id, outputCombo?.id]).join("."),
                description,
                type: "dataElements",
            }));

            return [
                ...dataElementVariables,
                ..._.flatMap(dataElementVariables, "options"),
                ...constantVariables,
                ...orgUnitGroupVariables,
                ...predictorVariables,
            ];
        });
    }
}

const baseFields = { id: true, name: true, code: true, description: true };

function buildLabel(key: string): string {
    switch (key) {
        case "aggregationType":
            return i18n.t("Aggregation Type");
        case "aggregationLevels":
            return i18n.t("Aggregation Levels");
        case "domainType":
            return i18n.t("Domain Type");
        case "valueType":
            return i18n.t("Value Type");
        case "zeroIsSignificant":
            return i18n.t("Zero Is Significant");
        case "categoryCombo":
            return i18n.t("Category Combo");
        case "code":
            return i18n.t("Code");
        default:
            return key;
    }
}

function buildValue(value: unknown): string {
    if (Array.isArray(value)) return value.map(item => buildValue(item)).join(", ");
    if (value === true) return "Yes";
    if (value === false) return "No";
    if (_.has(value, "name")) return (value as any).name;
    if (_.has(value, "id")) return (value as any).id;
    if (typeof value === "string") return value;
    return "";
}
