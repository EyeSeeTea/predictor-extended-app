import { FieldState, NoticeBox, Transfer, TransferProps } from "@dhis2/ui";
import React from "react";
import styled from "styled-components";
import { NamedRef } from "../../../../domain/entities/DHIS2";

export type TransferFFProps = {
    input: any;
    meta: FieldState<NamedRef[]>;
    error?: boolean;
    loading?: boolean;
    showLoadingStatus?: boolean;
    showValidStatus?: boolean;
    valid?: boolean;
    validationText?: string;
} & Omit<TransferProps, "loading" | "onChange" | "selected">;

export const TransferFF = ({
    input,
    meta,
    validationText,
    loading,
    showLoadingStatus,
    options,
    ...rest
}: TransferFFProps) => {
    const isLoading = loading || (showLoadingStatus && meta.validating);
    const message = validationText ?? meta.error ?? meta.submitError;

    return (
        <React.Fragment>
            <Transfer
                {...rest}
                options={options}
                loading={isLoading}
                onChange={({ selected }) =>
                    input.onChange(
                        selected.map(id => ({ id, name: options.find(item => item.value === id)?.label ?? "" }))
                    )
                }
                selected={input.value.map(({ id }: NamedRef) => id)}
            />

            {!!message && <WarningBox warning={true} title={message} />}
        </React.Fragment>
    );
};

const WarningBox = styled(NoticeBox)`
    margin-top: 20px;
    align-items: center;

    h6 {
        margin: 0px;
    }
`;
