import { SnackbarLevel, SnackbarOptions, useSnackbar } from "@eyeseetea/d2-ui-components";
import useDeepCompareEffect from "use-deep-compare-effect";

export const SnackbarMessage: React.FC<SnackbarMessageProps> = (props: SnackbarMessageProps) => {
    const snackbar = useSnackbar();

    useDeepCompareEffect(() => {
        snackbar.openSnackbar(props.variant ?? "info", props.message, props.options);
    }, [props, snackbar]);

    return null;
};

export interface SnackbarMessageProps {
    variant?: SnackbarLevel;
    message: string;
    options?: Partial<SnackbarOptions>;
}
