import { FieldState, NoticeBox } from "@dhis2/ui";
import React from "react";
import styled from "styled-components";
import { ExpressionValidation } from "../../../../domain/repositories/PredictorRepository";
import { ExpressionBox, ExpressionBoxProps } from "../../expression-box/ExpressionBox";

export const ExpressionBoxFF: React.FC<ExpressionBoxFFProps> = ({ input, expressionValidation, ...props }) => {
    return (
        <React.Fragment>
            <ExpressionBox {...props} onChange={input.onChange} formula={input.value} />

            {!!expressionValidation && (
                <WarningBox error={expressionValidation.status === "ERROR"} title={expressionValidation.message}>
                    {expressionValidation.description}
                </WarningBox>
            )}
        </React.Fragment>
    );
};

export type ExpressionBoxFFProps = Omit<ExpressionBoxProps, "onChange" | "formula"> & {
    input: any;
    meta: FieldState<string>;
    error?: boolean;
    loading?: boolean;
    showLoadingStatus?: boolean;
    showValidStatus?: boolean;
    valid?: boolean;
    validationText?: string;
    expressionValidation?: ExpressionValidation;
};

const WarningBox = styled(NoticeBox)`
    margin-top: 20px;
    align-items: center;

    h6 {
        margin: 0px;
    }
`;
