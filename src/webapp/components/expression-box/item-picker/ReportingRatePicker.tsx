import { InputField, MenuItem, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ListOptions } from "../../../../domain/repositories/MetadataRepository";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useFuture } from "../../../hooks/useFuture";
import { StyledMenu, StyledPagination } from "./ItemPicker";

const type = "dataSets";

export const ReportingRatePicker: React.FC<ReportingRatePickerProps> = ({ append }) => {
    const { compositionRoot } = useAppContext();

    const [options, setOptions] = useState<ListOptions>({});
    const [selectedRate, setSelectedRate] = useState<string>("REPORTING_RATE");
    const { data: variableList, refetch: updateVariableList } = useFuture(compositionRoot.metadata.list, [type]);

    useEffect(() => {
        updateVariableList(type, options);
    }, [options, updateVariableList]);

    return (
        <React.Fragment>
            <Flex>
                <Picker selected={selectedRate} onChange={({ selected }) => setSelectedRate(selected)}>
                    {reportingRateOptions.map(({ value, label }) => (
                        <SingleSelectOption value={value} label={label} key={value} />
                    ))}
                </Picker>

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
                    <MenuItem
                        key={`item-${item.id}`}
                        label={item.name}
                        onClick={() => append(`${item.id}.${selectedRate}`)}
                    />
                ))}
            </StyledMenu>
        </React.Fragment>
    );
};

export interface ReportingRatePickerProps {
    append: (item: string) => void;
}

const TextField = styled(InputField)`
    margin: 10px;
    flex-grow: 1;
`;

const Picker = styled(SingleSelectField)`
    margin: 10px;
    flex-grow: 1;
`;

const Flex = styled.div`
    display: flex;
`;

const reportingRateOptions = [
    { value: "REPORTING_RATE", label: i18n.t("Reporting rate") },
    { value: "REPORTING_RATE_ON_TIME", label: i18n.t("Reporting rate on time") },
    { value: "ACTUAL_REPORTS", label: i18n.t("Actual reports") },
    { value: "ACTUAL_REPORTS_ON_TIME", label: i18n.t("Actual reports on time") },
    { value: "EXPECTED_REPORTS", label: i18n.t("Expected reports") },
];
