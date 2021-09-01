import { Button } from "@dhis2/ui";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FormulaVariable } from "../../../domain/entities/FormulaVariable";
import { useAppContext } from "../../contexts/app-context";
import { ExpressionEditor } from "../expression-editor/ExpressionEditor";
import { TabRow } from "../tab-row/TabRow";
import { ItemPicker, ItemPickerType, itemPickerTypes } from "./item-picker/ItemPicker";

const functionsForExpressionType: any = {
    indicator: [".periodOffset("],
};

export interface ExpressionBoxProps {
    formula: string;
    onChange: (value: string) => void;
    expressionType: "indicator" | "programIndicator" | "validationRule" | "predictor";
}

export const ExpressionBox: React.FC<ExpressionBoxProps> = ({ expressionType, formula, onChange }) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [variables, setVariables] = useState<FormulaVariable[]>();

    const [variableListType, setVariableListType] = useState<ItemPickerType>("dataElements");

    const extraFunctionsForType = expressionType ? functionsForExpressionType[expressionType] : [];

    const formulaChange = (formula = "") => {
        onChange(formula);
    };

    const appendToFormula = (partToAppend: string) => {
        formulaChange(`${trimTrailing(formula)} ${partToAppend}`);
    };

    useEffect(() => {
        compositionRoot.expressions.getSuggestions().run(
            variables => setVariables(variables),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    return (
        <GridContainer>
            <GridItem column={1}>
                {variables ? (
                    <FormulaEditor
                        type="predictor-generator"
                        variables={variables}
                        value={formula}
                        onChange={formulaChange}
                    />
                ) : null}

                <Wrapper>
                    <FunctionButton value={"if("} label={"if"} handleClick={appendToFormula} />
                    <FunctionButton value={"isNull("} label={"isNull"} handleClick={appendToFormula} />
                    <FunctionButton value={"isNotNull("} label={"isNotNull"} handleClick={appendToFormula} />
                    <FunctionButton value={"firstNonNull("} label={"firstNonNull"} handleClick={appendToFormula} />
                    <FunctionButton value={"greatest("} label={"greatest"} handleClick={appendToFormula} />
                    <FunctionButton value={"least("} label={"least"} handleClick={appendToFormula} />
                    <FunctionButton value={"log("} label={"log"} handleClick={appendToFormula} />
                    <FunctionButton value={"log10("} label={"log10"} handleClick={appendToFormula} />
                    <FunctionButton value={"[days]"} label={"days"} handleClick={appendToFormula} />

                    {extraFunctionsForType?.map((funcName: string) => (
                        <FunctionButton key={`${funcName}`} value={funcName} handleClick={appendToFormula} />
                    ))}
                </Wrapper>
            </GridItem>

            <GridItem column={2}>
                <TabRow<ItemPickerType>
                    options={tabs}
                    selected={variableListType}
                    onClick={value => setVariableListType(value)}
                />
                <ItemPicker type={variableListType} append={appendToFormula} />
            </GridItem>
        </GridContainer>
    );
};

const tabs: Array<{ value: ItemPickerType; label: string }> = _(itemPickerTypes)
    .mapValues((label, value) => ({ label, value: value as ItemPickerType }))
    .values()
    .value();

const GridContainer = styled.div`
    display: grid;
    grid-gap: 20px;
    grid-auto-columns: 50%;
    margin-right: 25px;
`;

const GridItem = styled.div<{ column: number; expand?: boolean }>`
    grid-column: ${props => props.column} ${props => (props.expand ? "/ span 2" : "")};
    grid-row: auto;
    padding: 20px;

    border: 1px solid rgb(160, 173, 186);
    border-radius: 3px;
    box-shadow: rgb(48 54 60 / 10%) 0px 1px 2px 0px inset;
`;

const FormulaEditor = styled(ExpressionEditor)`
    box-sizing: border-box;
    font-size: 14px;
    line-height: 16px;
    user-select: text;
    color: rgb(33, 41, 52);
    background-color: white;
    padding: 12px 11px 10px;
    outline: 0px;
    border: 1px solid rgb(160, 173, 186);
    border-radius: 3px;
    box-shadow: rgb(48 54 60 / 10%) 0px 1px 2px 0px inset;
    text-overflow: ellipsis;
`;

function trimTrailing(x: string) {
    return x.replace(/\s+$/gm, "");
}

const FunctionButton: React.FC<{ label?: string; value: string; handleClick: (value: string) => void }> = ({
    handleClick,
    value,
    label,
}) => {
    const onFunctionClick = ({ value }: { value?: string }) => {
        if (value) handleClick(value);
    };

    return (
        <StyledButton value={value} onClick={onFunctionClick}>
            {label ?? value}
        </StyledButton>
    );
};

const StyledButton = styled(Button)`
    min-width: 50px;
    margin: 5px;
    padding: 0 5px;

    :focus::after {
        border-color: transparent !important;
    }
`;

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
`;
