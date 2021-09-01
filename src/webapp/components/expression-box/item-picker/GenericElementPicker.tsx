import { MenuItem } from "@dhis2/ui";
import React from "react";
import { D2ModelSchemas } from "../../../../types/d2-api";
import { useAppContext } from "../../../contexts/app-context";
import { useFuture } from "../../../hooks/useFuture";
import { StyledMenu, StyledPagination } from "./ItemPicker";

export const GenericElementPicker: React.FC<GenericElementPickerProps> = ({ type, append }) => {
    const { compositionRoot } = useAppContext();

    const { data: variableList, refetch: updateVariableList } = useFuture(compositionRoot.metadata.list, [type]);

    return (
        <React.Fragment>
            <StyledPagination
                page={variableList?.pager.page ?? 0}
                pageCount={variableList?.pager.pageCount ?? 0}
                pageSize={variableList?.pager.pageSize ?? 0}
                total={variableList?.pager.total ?? 0}
                hidePageSelect={true}
                hidePageSizeSelect={true}
                onPageChange={page => updateVariableList(type, { page, pageSize: variableList?.pager.pageSize })}
                onPageSizeChange={pageSize => updateVariableList(type, { page: variableList?.pager.page, pageSize })}
            />
            <StyledMenu dense={true}>
                {variableList?.objects.map(item => (
                    <MenuItem key={`item-${item.id}`} label={item.name} onClick={() => append(item.id)} />
                ))}
            </StyledMenu>
        </React.Fragment>
    );
};

export interface GenericElementPickerProps {
    type: keyof D2ModelSchemas;
    append: (item: string) => void;
}
