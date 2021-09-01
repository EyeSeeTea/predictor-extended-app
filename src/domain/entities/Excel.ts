import { Style } from "@eyeseetea/xlsx-populate";

export interface Address {
    row: number;
    column: number;
}

export interface CellRef {
    type: "cell";
    sheet: string;
    address: Address;
}

export interface RangeRef {
    type: "range";
    sheet: string;
    start: Address;
    end: Address;
}

export interface RowRef {
    type: "row";
    sheet: string;
    row: number;
}

export interface ColumnRef {
    type: "column";
    sheet: string;
    column: number;
}

export interface CellTextContent {
    type: "text";
    value: string | number | boolean;
}

export interface CellFormulaContent {
    type: "formula";
    value: string;
}

export type CellContents = CellTextContent | CellFormulaContent;
export type Ref = CellRef | RangeRef;

export interface ExcelCell {
    ref: Ref;
    contents: CellContents;
    style?: Style & { columnWidth?: number; rowHeight?: number };
}

export interface ExcelSheet {
    cells: ExcelCell[];
}

export interface ExcelModel {
    sheets: Record<string, ExcelSheet>;
    definedNames: Record<string, ExcelCell>;
}

export function getRow(ref: Ref): number {
    return ref.type === "cell" ? ref.address.row : ref.start.row;
}

export function getColumn(ref: Ref): number {
    return ref.type === "cell" ? ref.address.column : ref.start.column;
}
