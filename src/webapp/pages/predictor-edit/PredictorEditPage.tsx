import { useConfig } from "@dhis2/app-runtime";
import { Button } from "@dhis2/ui";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { OpenInNew } from "@material-ui/icons";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { defaultPredictor, Predictor } from "../../../domain/entities/Predictor";
import i18n from "../../../locales";
import { generateUid } from "../../../utils/uid";
import { PageHeader } from "../../components/page-header/PageHeader";
import { PredictorEditWizard } from "../../components/predictor-edit-wizard/PredictorEditWizard";
import { useAppContext } from "../../contexts/app-context";
import { useGoBack } from "../../hooks/useGoBack";

export interface PredictorEditPageProps {
    type: "new" | "edit";
    id?: string;
}

export const PredictorEditPage: React.FC<PredictorEditPageProps> = ({ type, id }) => {
    const { baseUrl } = useConfig();
    const { compositionRoot } = useAppContext();
    const location = useLocation<{ predictor: Predictor }>();

    const snackbar = useSnackbar();
    const goBack = useGoBack();

    const [predictor, setPredictor] = useState<Predictor>(location.state?.predictor);

    const isValidEdit = id !== undefined || location.state?.predictor !== undefined;
    const title = type === "edit" && isValidEdit ? i18n.t("Edit predictor") : i18n.t("New predictor");

    const savePredictor = useCallback(
        async (predictor: Predictor) => {
            const { data = [], error } = await compositionRoot.predictors.save([predictor]).runAsync();
            if (error || _.some(data, ({ status }) => status === "ERROR")) {
                return error ?? i18n.t("Network error");
            } else {
                goBack(true);
            }
        },
        [compositionRoot, goBack]
    );

    const openMaintenance = useCallback(() => {
        window
            ?.open(`${baseUrl}/dhis-web-maintenance/index.html#/edit/otherSection/predictor/${id}`, "_blank")
            ?.focus();
    }, [baseUrl, id]);

    useEffect(() => {
        if (predictor !== undefined) return;
        else if (id === undefined) {
            setPredictor({ ...defaultPredictor, id: generateUid() });
            return;
        }

        compositionRoot.predictors
            .get(_.compact([id]))
            .toPromise()
            .then(([predictor]) => {
                if (!predictor) snackbar.error(i18n.t("Unable to load predictor {{id}}", { id }));
                else setPredictor(predictor);
            });
    }, [compositionRoot, id, predictor, setPredictor, snackbar]);

    return (
        <Wrapper>
            <PageHeader onBackClick={goBack} title={title}>
                {isValidEdit && (
                    <MaintenanceButton icon={<OpenInNew />} onClick={openMaintenance}>
                        {i18n.t("Open in maintenance")}
                    </MaintenanceButton>
                )}
            </PageHeader>

            {predictor !== undefined ? (
                <PredictorEditWizard predictor={predictor} onCancel={goBack} onSave={savePredictor} />
            ) : null}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin: 20px 30px;
`;

const MaintenanceButton = styled(Button)`
    float: right;
    margin-top: 2px;

    :focus::after {
        border-color: transparent !important;
    }
`;
