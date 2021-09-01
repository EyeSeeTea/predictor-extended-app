import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { useCallback, useState } from "react";
import { PeriodObject } from "../../../domain/entities/SchedulerPeriod";
import i18n from "../../../locales";
import { PeriodPicker } from "../period-picker/PeriodPicker";

export interface RunPredictorDialogProps {
    onClose: () => void;
    onExecute: (period: PeriodObject) => Promise<void>;
}

export const RunPredictorDialog = (props: RunPredictorDialogProps) => {
    const { onClose, onExecute } = props;

    const [period, setPeriod] = useState<PeriodObject>({ type: "THIS_MONTH" });

    const onSave = useCallback(async () => {
        await onExecute(period);
    }, [onExecute, period]);

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Select period to run predictions")}
            saveText={i18n.t("Run")}
            onCancel={onClose}
            onSave={onSave}
            fullWidth={true}
            maxWidth={"lg"}
        >
            <PeriodPicker period={period} onChange={setPeriod} />
        </ConfirmationDialog>
    );
};
