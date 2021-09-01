import { Button, ButtonStrip, NoticeBox } from "@dhis2/ui";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { Paper, Step, StepLabel, Stepper } from "@material-ui/core";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import { FORM_ERROR } from "final-form";
import _ from "lodash";
import React, { FunctionComponent, useCallback, useState } from "react";
import { Form } from "react-final-form";
import styled from "styled-components";
import { Predictor } from "../../../domain/entities/Predictor";
import { useGoBack } from "../../hooks/useGoBack";
import { PredictorEditWizardStep, PredictorEditWizardStepProps } from "./PredictorEditWizardStep";

const steps: WizardStep[] = [
    {
        key: `general-info`,
        label: i18n.t("General info"),
        component: PredictorEditWizardStep,
        props: {
            fields: [
                "name",
                "code",
                "description",
                "periodType",
                "output",
                "organisationUnitLevels",
                "predictorGroups",
            ],
        },
    },
    {
        key: `generator`,
        label: i18n.t("Generator"),
        component: PredictorEditWizardStep,
        props: { fields: ["generator.description", "generator.expression", "generator.missingValueStrategy"] },
    },
    {
        key: `sample`,
        label: i18n.t("Samples"),
        component: PredictorEditWizardStep,
        props: {
            fields: [
                "sequentialSampleCount",
                "annualSampleCount",
                "sequentialSkipCount",
                "sampleSkipTest.description",
                "sampleSkipTest.expression",
            ],
        },
    },
    {
        key: `scheduling`,
        label: i18n.t("Scheduling"),
        component: PredictorEditWizardStep,
        props: {
            fields: ["scheduling.sequence", "scheduling.variable"],
        },
    },
];

interface WizardStep {
    key: string;
    label: string;
    component: FunctionComponent<PredictorEditWizardStepProps>;
    props: PredictorEditWizardStepProps;
}

export interface PredictorEditWizardProps {
    predictor: Predictor;
    onCancel: () => void;
    onSave: (predictor: Predictor) => Promise<string | undefined>;
}

export const PredictorEditWizard: React.FC<PredictorEditWizardProps> = ({ predictor, onSave, onCancel }) => {
    const goBack = useGoBack();

    const onSubmit = useCallback(
        async (values: { predictors: Predictor[] }) => {
            const predictor = values.predictors[0];
            if (!predictor) return { [FORM_ERROR]: i18n.t("Error saving predictor") };

            const error = await onSave(predictor);
            if (error) return { [FORM_ERROR]: error };

            goBack(true);
        },
        [onSave, goBack]
    );

    return (
        <Form<{ predictors: Predictor[] }>
            autocomplete="off"
            onSubmit={onSubmit}
            initialValues={{ predictors: [predictor] }}
            render={({ handleSubmit, submitError }) => (
                <form onSubmit={handleSubmit}>
                    {submitError && (
                        <NoticeBox title={i18n.t("Error saving predictor")} error={true}>
                            {submitError}
                        </NoticeBox>
                    )}

                    <Wizard onCancel={onCancel}>
                        {steps.map(({ component: Component, props, key }) => (
                            <Component key={key} {...props} />
                        ))}
                    </Wizard>
                </form>
            )}
        />
    );
};

const Wizard: React.FC<{ onCancel: any }> = ({ children, onCancel }) => {
    const [step, setStep] = useState<string>(steps[0]?.key ?? "");
    const index = _.findIndex(steps, ({ key }) => key === step);
    const page = index > 0 ? index : 0;
    const activePage = React.Children.toArray(children)[page];

    const onNext = useCallback(() => {
        setStep(step => {
            const index = steps.findIndex(({ key }) => key === step);
            return steps[index + 1]?.key ?? step;
        });
    }, []);

    const onPrev = useCallback(() => {
        setStep(step => {
            const index = steps.findIndex(({ key }) => key === step);
            return steps[index - 1]?.key ?? step;
        });
    }, []);

    const jumpStep = useCallback((currentStep: string) => setStep(currentStep), []);

    return (
        <Container>
            <Wrapper>
                <StyledStepper activeStep={page} nonLinear={true}>
                    {steps.map(({ key, label }) => (
                        <Step key={key} onClick={() => jumpStep(key)}>
                            <StyledStepLabel>{label}</StyledStepLabel>
                        </Step>
                    ))}
                </StyledStepper>

                {activePage}
            </Wrapper>

            <ButtonsRow middle>
                <Button onClick={onPrev} icon={<ArrowBack />} />

                <Button type="submit" primary>
                    {i18n.t("Save")}
                </Button>

                <Button type="reset" onClick={onCancel}>
                    {i18n.t("Cancel")}
                </Button>

                <Button onClick={onNext} icon={<ArrowForward />} />
            </ButtonsRow>
        </Container>
    );
};

const StyledStepLabel = styled(StepLabel)`
    :hover {
        cursor: pointer;
    }
`;

const StyledStepper = styled(Stepper)`
    padding: 20px 20px 35px;
`;

const ButtonsRow = styled(ButtonStrip)`
    padding: 20px;

    button:focus::after {
        border-color: transparent !important;
    }
`;

const Container = styled.div`
    margin: 10px;
`;

const Wrapper = styled(Paper)`
    padding: 45px;
`;
