export interface FormulaVariable {
    id: string;
    label: string;
    filterText: string;
    insertText: string;
    description?: string;
    properties?: FormulaVariableProperties[];
    options?: FormulaVariable[];
    autocomplete: boolean;
    type: string;
}

export interface FormulaVariableProperties {
    property: string;
    label: string;
    value: string;
}
