import { InputField, MenuItem } from "@dhis2/ui";
import React, { useEffect } from "react";
import styled from "styled-components";
import { ListOptions } from "../../../../domain/repositories/MetadataRepository";
import { D2ModelSchemas } from "../../../../types/d2-api";
import { useAppContext } from "../../../contexts/app-context";
import { useFuture } from "../../../hooks/useFuture";
import { StyledMenu, StyledPagination } from "./ItemPicker";

export const GenericElementPicker: React.FC<GenericElementPickerProps> = ({ type, append }) => {
    const { compositionRoot } = useAppContext();

    const [options, setOptions] = React.useState<ListOptions>({});
    const { data: variableList, refetch: updateVariableList } = useFuture(compositionRoot.metadata.list, [type]);

    useEffect(() => {
        updateVariableList(type, options);
    }, [type, options, updateVariableList]);

    return (
        <React.Fragment>
            <Flex>
                <TextField
                    value={options.filter ?? ""}
                    onChange={({ value }) => setOptions(options => ({ ...options, filter: value }))}
                />

                <StyledPagination
                    page={variableList?.pager.page ?? 0}
                    pageCount={variableList?.pager.pageCount ?? 0}
                    pageSize={variableList?.pager.pageSize ?? 0}
                    total={variableList?.pager.total ?? 0}
                    hidePageSelect={true}
                    hidePageSizeSelect={true}
                    onPageChange={page =>
                        setOptions(options => ({ ...options, page, pageSize: variableList?.pager.pageSize }))
                    }
                    onPageSizeChange={pageSize =>
                        setOptions(options => ({ ...options, page: variableList?.pager.page, pageSize }))
                    }
                />
            </Flex>

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

const TextField = styled(InputField)`
    margin: 10px;
    flex-grow: 1;
`;

const Flex = styled.div`
    display: flex;
`;
