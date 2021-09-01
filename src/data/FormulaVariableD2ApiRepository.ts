import _ from "lodash";
import { FormulaVariable } from "../domain/entities/FormulaVariable";
import { FutureData } from "../domain/entities/Future";
import { Instance } from "../domain/entities/Instance";
import { FormulaVariableRepository } from "../domain/repositories/FormulaVariableRepository";
import i18n from "../locales";
import { D2Api } from "../types/d2-api";
import { getD2APiFromInstance } from "./utils/d2-api";
import { apiToFuture } from "./utils/futures";

export class FormulaVariableD2ApiRepository implements FormulaVariableRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public get(): FutureData<FormulaVariable[]> {
        return apiToFuture(
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
                ...buildVariable(id, name, description, rest),
                type: "dataElements",
                options: categoryCombo.categoryOptionCombos.map(({ id, name, description }) => ({
                    id,
                    label: name,
                    filterText: name,
                    insertText: id,
                    description,
                    type: "categoryOptionCombos",
                })),
            }));

            const dataElementByCodeVariables = dataElements
                .filter(({ code }) => code !== undefined)
                .map(({ id, code, description, categoryCombo, ...rest }) => ({
                    ...buildVariable(id, code, description, rest),
                    type: "dataElements",
                    options: categoryCombo.categoryOptionCombos.map(({ id, name, description }) => ({
                        id,
                        label: name,
                        filterText: name,
                        insertText: id,
                        description,
                        type: "categoryOptionCombos",
                    })),
                }));

            const constantVariables = constants.map(({ id, name, description, ...rest }) => ({
                ...buildVariable(id, name, description, rest),
                type: "constants",
            }));

            const orgUnitGroupVariables = organisationUnitGroups.map(({ id, name, description, ...rest }) => ({
                ...buildVariable(id, name, description, rest),
                type: "organisationUnitGroups",
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
                ...dataElementByCodeVariables,
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

function buildVariable(id: string, label: string, description: string, rest: Record<string, any>) {
    return {
        id,
        label,
        filterText: label,
        insertText: id,
        description,
        properties: _(rest)
            .mapValues((value, key) => ({
                property: key,
                label: buildLabel(key),
                value: buildValue(value),
            }))
            .values()
            .value(),
    };
}
