import { InputField } from "@dhis2/ui";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Settings } from "../../../domain/entities/Settings";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useAppContext } from "../../contexts/app-context";
import { useGoBack } from "../../hooks/useGoBack";

export const SettingsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const goBack = useGoBack();
    const snackbar = useSnackbar();

    const [settings, setSettings] = useState<Settings>();

    const updateSettings = useCallback(
        (setting: keyof Settings["scheduling"], value: string | number) => {
            if (!settings) return;

            const updatedSettings = { ...settings, scheduling: { ...settings.scheduling, [setting]: value } };
            setSettings(updatedSettings);
            compositionRoot.settings.save(updatedSettings).run(
                () => {},
                error => {
                    snackbar.error(error);
                }
            );
        },
        [compositionRoot, settings, snackbar]
    );

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

            <h3>{i18n.t("Scheduling")}</h3>

            <b>{i18n.t("Recurrence (hours)")}</b>

            <InputField
                value={`${settings.scheduling.recurrence}`}
                onChange={({ value }) => updateSettings("recurrence", parseInt(value ?? "0"))}
                type="number"
                min="0"
            />

            <b>{i18n.t("Delay between executions (seconds)")}</b>

            <InputField
                value={settings.scheduling.delay.toString()}
                onChange={({ value }) => updateSettings("delay", parseInt(value ?? "0"))}
                type="number"
                min="0"
            />
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin: 20px;

    b,
    input,
    h3 {
        margin: 20px;
    }
`;
