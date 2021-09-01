import {
    composeValidators,
    createMaxCharacterLength,
    createMinNumber,
    createPattern,
    FieldState,
    hasValue,
    InputFieldFF,
    integer,
    SingleSelectFieldFF,
} from "@dhis2/ui";
import _ from "lodash";
import React from "react";
import { ExpressionValidation } from "../../../domain/repositories/PredictorRepository";
import i18n from "../../../locales";
import { fullUidRegex } from "../../../utils/uid";
import { useAppContext } from "../../contexts/app-context";
import { FormField } from "../form/fields/FormField";
import { NumberInputFF } from "../form/fields/NumberInputFF";
import { PreviewInputFF } from "../form/fields/PreviewInputFF";
import { ExpressionBoxFF } from "./components/ExpressionBoxFF";
import { OrgUnitLevelsFF } from "./components/OrgUnitLevelsFF";
import { OutputFF } from "./components/OutputFF";
import { PredictorGroupsFF } from "./components/PredictorGroupsFF";

const useValidations = (
    field: PredictorFormField,
    name: string
): { validation?: (...args: any[]) => any; props?: object } => {
    const { compositionRoot } = useAppContext();

    const [expressionValidation, setExpressionValidation] = React.useState<
        Record<string, ExpressionValidation | undefined>
    >({});

    const validateExpression = (formula: string, _allValues: object, meta?: FieldState<string>) => {
        if (!meta) return;
        else if (!formula || !formula.trim()) {
            setExpressionValidation(validations => ({ ...validations, [meta.name]: undefined }));
            return;
        }

        const type = field === "generator.expression" ? "predictor-formula" : "predictor-skip-test";
        compositionRoot.expressions.validate(type, formula).run(
            validation => setExpressionValidation(validations => ({ ...validations, [meta.name]: validation })),
            error =>
                setExpressionValidation(validations => ({
                    ...validations,
                    [meta.name]: {
                        message: i18n.t("Unable to validate"),
                        status: "ERROR",
                        description: error,
                    },
                }))
        );
    };

    switch (field) {
        case "id":
            return { validation: createPattern(fullUidRegex, i18n.t("Please provide a valid identifier")) };
        case "description":
        case "generator.description":
        case "sampleSkipTest.description":
            return { validation: createMaxCharacterLength(255) };
        case "sequentialSampleCount":
        case "annualSampleCount":
        case "sequentialSkipCount":
        case "scheduling.sequence":
        case "scheduling.variable":
            return { validation: composeValidators(integer, createMinNumber(0)) };
        case "generator.expression":
        case "sampleSkipTest.expression":
            return {
                validation: validateExpression,
                props: {
                    expressionValidation: expressionValidation[name],
                    warning:
                        expressionValidation[name]?.status === "ERROR"
                            ? expressionValidation[name]?.message
                            : undefined,
                },
            };
        default: {
            const required = predictorRequiredFields.includes(field);
            return { validation: required ? hasValue : undefined };
        }
    }
};

export const RenderPredictorWizardField: React.FC<{ row: number; field: PredictorFormField }> = ({ row, field }) => {
    const name = `predictors[${row}.${field}]`;
    const { validation, props: validationProps = {} } = useValidations(field, name);
    const props = {
        name,
        placeholder: getPredictorFieldName(field),
        validate: validation,
        ...validationProps,
    };

    switch (field) {
        case "id":
        case "code":
        case "description":
        case "name":
        case "generator.description":
        case "sampleSkipTest.description":
            return <FormField {...props} component={InputFieldFF} />;
        case "output":
            return <FormField {...props} component={OutputFF} optionComboField={`predictors[${row}.outputCombo]`} />;
        case "periodType":
            return <FormField {...props} component={SingleSelectFieldFF} options={periodTypes} />;
        case "organisationUnitLevels":
            return <FormField {...props} component={OrgUnitLevelsFF} />;
        case "predictorGroups":
            return <FormField {...props} component={PredictorGroupsFF} />;
        case "generator.missingValueStrategy":
            return <FormField {...props} component={SingleSelectFieldFF} options={missingValueStrategy} />;
        case "sequentialSampleCount":
        case "annualSampleCount":
        case "sequentialSkipCount":
        case "scheduling.sequence":
        case "scheduling.variable":
            return <FormField {...props} component={NumberInputFF} defaultValue="0" min="0" />;
        case "generator.expression":
        case "sampleSkipTest.expression":
            return <FormField {...props} component={ExpressionBoxFF} expressionType="predictor" />;
        default:
            return null;
    }
};

export const RenderPredictorImportField: React.FC<{ row: number; field: PredictorFormField }> = ({ row, field }) => {
    const name = `predictors[${row}.${field}]`;
    const { validation, props: validationProps = {} } = useValidations(field, name);

    const props = {
        name,
        placeholder: getPredictorFieldName(field),
        validate: validation,
        ...validationProps,
    };

    switch (field) {
        case "organisationUnitLevels":
        case "predictorGroups":
        case "generator.expression":
        case "sampleSkipTest.expression":
        case "output":
            return (
                <PreviewInputFF {...props}>
                    <RenderPredictorWizardField row={row} field={field} />
                </PreviewInputFF>
            );
        default:
            return <RenderPredictorWizardField row={row} field={field} />;
    }
};

export type PredictorFormField = typeof predictorFormFields[number];

export const predictorFormFields = [
    "id",
    "code",
    "name",
    "description",
    "output",
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

const predictorRequiredFields: PredictorFormField[] = ["name", "generator.expression", "output", "outputCombo"];

export const getPredictorName = (field: PredictorFormField) => {
    switch (field) {
        case "id":
            return i18n.t("Identifier");
        case "code":
            return i18n.t("Code");
        case "name":
            return i18n.t("Name");
        case "description":
            return i18n.t("Description");
        case "output":
            return i18n.t("Output data element");
        case "outputCombo":
            return i18n.t("Output category combo");
        case "periodType":
            return i18n.t("Period type");
        case "annualSampleCount":
            return i18n.t("Annual sample count");
        case "sequentialSampleCount":
            return i18n.t("Sequential sample count");
        case "sequentialSkipCount":
            return i18n.t("Sequential skip count");
        case "organisationUnitLevels":
            return i18n.t("Organisation unit levels");
        case "predictorGroups":
            return i18n.t("Predictor groups");
        case "generator.description":
            return i18n.t("Generator description");
        case "generator.missingValueStrategy":
            return i18n.t("Missing value strategy");
        case "generator.expression":
            return i18n.t("Generator formula");
        case "sampleSkipTest.description":
            return i18n.t("Sample skip test description");
        case "sampleSkipTest.expression":
            return i18n.t("Sample skip test formula");
        case "scheduling.sequence":
            return i18n.t("Sequence");
        case "scheduling.variable":
            return i18n.t("Variable");
    }
};

export const getPredictorFieldName = (field: PredictorFormField) => {
    const name = getPredictorName(field);
    const required = predictorRequiredFields.includes(field);
    return _.compact([name, required ? "(*)" : undefined]).join(" ");
};

export const periodTypes = [
    { value: "Daily", label: i18n.t("Daily") },
    { value: "Weekly", label: i18n.t("Weekly") },
    { value: "WeeklyWednesday", label: i18n.t("Weekly starting Wednesday") },
    { value: "WeeklyThursday", label: i18n.t("Weekly starting Thursday") },
    { value: "WeeklySaturday", label: i18n.t("Weekly starting Saturday") },
    { value: "WeeklySunday", label: i18n.t("Weekly starting Sunday") },
    { value: "BiWeekly", label: i18n.t("Biweekly") },
    { value: "Monthly", label: i18n.t("Monthly") },
    { value: "BiMonthly", label: i18n.t("Bi-monthly") },
    { value: "Quarterly", label: i18n.t("Quarterly") },
    { value: "SixMonthly", label: i18n.t("Six-monthly") },
    { value: "SixMonthlyApril", label: i18n.t("Six-monthly starting April") },
    { value: "SixMonthlyNov", label: i18n.t("Six-monthly starting November") },
    { value: "Yearly", label: i18n.t("Yearly") },
    { value: "FinancialApril", label: i18n.t("Financial year starting April") },
    { value: "FinancialJuly", label: i18n.t("Financial year starting July") },
    { value: "FinancialOct", label: i18n.t("Financial year starting October") },
    { value: "FinancialNov", label: i18n.t("Financial year starting November") },
];

export const missingValueStrategy = [
    { value: "SKIP_IF_ANY_VALUE_MISSING", label: i18n.t("Skip if any value is missing") },
    { value: "SKIP_IF_ALL_VALUES_MISSING", label: i18n.t("Skip if all values are missing") },
    { value: "NEVER_SKIP", label: i18n.t("Never skip") },
];
