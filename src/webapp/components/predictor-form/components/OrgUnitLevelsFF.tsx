import { TransferOption } from "@dhis2/ui";
import { NamedRef } from "../../../../domain/entities/DHIS2";
import { useAppContext } from "../../../contexts/app-context";
import { useFuture } from "../../../hooks/useFuture";
import { TransferFF, TransferFFProps } from "../../form/fields/TransferFF";

export const OrgUnitLevelsFF: React.FC<Omit<TransferFFProps, "options">> = props => {
    const { compositionRoot } = useAppContext();

    const { data: orgUnitLevels = [] } = useFuture(
        () =>
            compositionRoot.metadata.list("organisationUnitLevels").map(({ objects }) => buildTransferOptions(objects)),
        []
    );

    return (
        <TransferFF
            {...props}
            filterable
            filterablePicked
            selectedWidth="100%"
            optionsWidth="100%"
            options={orgUnitLevels}
        />
    );
};

const buildTransferOptions = (options: NamedRef[]): TransferOption[] => {
    return options.map(({ id, name }) => ({ value: id, label: name }));
};
