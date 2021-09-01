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
import {
    getPredictorFieldName,
    missingValueStrategy,
    periodTypes,
    PredictorFormField,
    predictorRequiredFields,
} from "./utils";

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
