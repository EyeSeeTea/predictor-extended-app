import { Button, CenteredContent, InputField } from "@dhis2/ui";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { Paper } from "@material-ui/core";
import cronstrue from "cronstrue";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { PeriodObject } from "../../../domain/entities/SchedulerPeriod";
import { Settings } from "../../../domain/entities/Settings";
import { UpdateMethod } from "../../../utils/utils";
import isValidCronExpression from "../../../utils/validCronExpression";
import { Dropdown, DropdownOption } from "../../components/dropdown/Dropdown";
import { PageHeader } from "../../components/page-header/PageHeader";
import { PeriodPicker } from "../../components/period-picker/PeriodPicker";
import { useAppContext } from "../../contexts/app-context";
import { useGoBack } from "../../hooks/useGoBack";

export const SettingsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const goBack = useGoBack();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [settings, setSettings] = useState<Settings>();

    const saveSettings = useCallback(() => {
        if (!settings) return;
        loading.show(true, i18n.t("Saving settings..."));

        compositionRoot.settings.save(settings).run(
            () => loading.reset(),
            error => {
                loading.reset();
                snackbar.error(error);
            }
        );
    }, [compositionRoot, settings, snackbar, loading]);

    const updateEnabled = useCallback((enabled: Enabled) => {
        setSettings(settings => {
            if (!settings) return;
            return {
                ...settings,
                scheduling:
                    enabled === "yes"
                        ? {
                              ...settings.scheduling,
                              ...defaultScheduling,
                              enabled: true,
                          }
                        : { ...settings.scheduling, enabled: false },
            };
        });
    }, []);

    const updatePeriod: UpdateMethod<PeriodObject> = useCallback(update => {
        setSettings(settings => {
            if (!settings) return;

            const oldPeriod: PeriodObject = settings.scheduling.enabled
                ? settings.scheduling.period
                : { type: "THIS_MONTH" };

            const period = _.isFunction(update) ? update(oldPeriod) : update;

            return { ...settings, scheduling: { ...settings.scheduling, period } };
        });
    }, []);

    const updateFrequency = useCallback(({ value }: { value?: string }) => {
        setSettings(settings => {
            if (!settings) return;

            return { ...settings, scheduling: { ...settings.scheduling, frequency: value ?? "" } };
        });
    }, []);

    const updateDelay = useCallback(({ value }: { value?: string }) => {
        setSettings(settings => {
            if (!settings) return;

            return { ...settings, scheduling: { ...settings.scheduling, delay: parseInt(value ?? "0") } };
        });
    }, []);

    useEffect(() => {
        compositionRoot.settings.get().run(
            settings => {
                setSettings(settings);
            },
            error => {
                snackbar.error(error);
            }
        );
    }, [compositionRoot, snackbar]);

    if (!settings) return null;

    return (
        <Wrapper>
            <PageHeader onBackClick={goBack} title={i18n.t("Settings")} />

            <Container>
                <h3>{i18n.t("Scheduling")}</h3>

                <Dropdown<Enabled>
                    label={i18n.t("Enabled")}
                    items={enabledOptions}
                    value={settings.scheduling.enabled ? "yes" : "no"}
                    onChange={updateEnabled}
                    hideEmpty={true}
                />

                {settings.scheduling.enabled ? (
                    <React.Fragment>
                        <InputField
                            label={i18n.t("Frequency (cron expression)")}
                            value={settings.scheduling.frequency}
                            onChange={updateFrequency}
                            warning={!isValidCronExpression(settings.scheduling.frequency)}
                            validationText={
                                isValidCronExpression(settings.scheduling.frequency)
                                    ? cronstrue.toString(settings.scheduling.frequency, {
                                          throwExceptionOnParseError: false,
                                          verbose: true,
                                      })
                                    : i18n.t("Invalid cron expression")
                            }
                        />

                        <InputField
                            label={i18n.t("Delay between predictions (in ms))")}
                            type="number"
                            value={`${settings.scheduling.delay}`}
                            onChange={updateDelay}
                            min="0"
                        />

                        <PeriodPicker
                            title={i18n.t("Prediction period")}
                            period={settings.scheduling.period}
                            onChange={updatePeriod}
                        />
                    </React.Fragment>
                ) : null}

                <CenteredContent>
                    <SaveButton primary={true} onClick={saveSettings}>
                        {i18n.t("Save")}
                    </SaveButton>
                </CenteredContent>
            </Container>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin: 20px 30px;
`;

const Container = styled(Paper)`
    margin: 10px;
    padding: 45px;

    label {
        margin: 20px 0;
        font-weight: bold;
    }
`;

const SaveButton = styled(Button)`
    margin-top: 20px;
`;

type Enabled = "yes" | "no";

const enabledOptions: DropdownOption<Enabled>[] = [
    { id: "yes", name: i18n.t("Yes") },
    { id: "no", name: i18n.t("No") },
];

const defaultScheduling = { period: { type: "THIS_MONTH" }, frequency: "0 0 0 ? * *", delay: 100 } as const;
