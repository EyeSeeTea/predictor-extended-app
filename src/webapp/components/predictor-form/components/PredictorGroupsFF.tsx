import { TransferOption } from "@dhis2/ui";
import { NamedRef } from "../../../../domain/entities/DHIS2";
import { useAppContext } from "../../../contexts/app-context";
import { useFuture } from "../../../hooks/useFuture";
import { TransferFF, TransferFFProps } from "../../form/fields/TransferFF";

export const PredictorGroupsFF: React.FC<Omit<TransferFFProps, "options">> = props => {
    const { compositionRoot } = useAppContext();

    const { data: predictorGroups = [] } = useFuture(
        () => compositionRoot.metadata.list("predictorGroups").map(({ objects }) => buildTransferOptions(objects)),
        []
    );

    return (
        <TransferFF
            {...props}
            filterable
            filterablePicked
            selectedWidth="100%"
            optionsWidth="100%"
            options={predictorGroups}
        />
    );
};

const buildTransferOptions = (options: NamedRef[]): TransferOption[] => {
    return options.map(({ id, name }) => ({ value: id, label: name }));
};
