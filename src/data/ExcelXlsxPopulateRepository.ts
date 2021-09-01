import XLSX, { Cell, Range, Sheet, Workbook } from "@eyeseetea/xlsx-populate";
import _ from "lodash";
import { Address, CellContents, CellRef, ExcelModel, ExcelSheet, RangeRef } from "../domain/entities/Excel";
import { ExcelRepository, ReadOptions, WriteOptions } from "../domain/repositories/ExcelRepository";

export class ExcelXlsxPopulateRepository implements ExcelRepository {
    public async createFile(): Promise<Buffer> {
        const workbook = await XLSX.fromBlankAsync();
        return this.toBuffer(workbook);
    }

    public async readFile(buffer: Buffer | ArrayBuffer, _options?: ReadOptions): Promise<ExcelModel> {
        const workbook = await this.fromBuffer(buffer);

        const sheets: Record<string, ExcelSheet> = _(workbook.sheets())
            .map(sheet => {
                const merged = sheet.merged();
                return [
                    sheet.name(),
                    {
                        cells: _.flatMap(sheet.rows(), row =>
                            row
                                .cells()
                                .filter(cell => cell.value() || cell.formula())
                                .map(cell => {
                                    const range = merged.find((range: Range) => range.cells()[0]?.includes(cell));
                                    return {
                                        contents: buildCellContents(cell),
                                        ref: range ? buildRangeRef(range) : buildCellRef(cell),
                                    };
                                })
                        ),
                    },
                ];
            })
            .fromPairs()
            .value();

        const definedNames = _(workbook.definedName())
            .map(name => [name, workbook.definedName(name)])
            .map(([name, cell]) => {
                if (!isCell(cell)) return undefined;
                return [
                    name,
                    {
                        ref: buildCellRef(cell),
                        contents: buildCellContents(cell),
                    },
                ];
            })
            .compact()
            .fromPairs()
            .value();

        return { sheets, definedNames };
    }

    public async writeFile(buffer: Buffer | ArrayBuffer, file: ExcelModel, _options?: WriteOptions): Promise<Buffer> {
        const workbook = await this.fromBuffer(buffer);

        for (const [sheetName, { cells }] of _.toPairs(file.sheets)) {
            const sheet = getOrCreateSheet(workbook, sheetName);
            for (const cell of cells) {
                const location = parseLocation(sheet, cell.ref);
                if (cell.contents.type === "formula") location.formula(cell.contents.value);
                else location.value(cell.contents.value);

                if (cell.style) {
                    const { columnWidth, rowHeight, ...props } = cell.style;
                    if (columnWidth && isCell(location)) location.column().width(columnWidth);
                    if (rowHeight && isCell(location)) location.row().height(rowHeight);

                    location.style(props);
                }
            }
        }

        for (const [name, cell] of _.toPairs(file.definedNames)) {
            const sheet = getOrCreateSheet(workbook, cell.ref.sheet);
            const location = parseLocation(sheet, cell.ref);
            workbook.definedName(name, location);
        }

        // TODO: Add options to keep existing sheets
        if (workbook.sheet("Sheet1")) workbook.deleteSheet("Sheet1");

        return this.toBuffer(workbook);
    }

    private fromBuffer(buffer: Buffer | ArrayBuffer): Promise<Workbook> {
        return XLSX.fromDataAsync(buffer);
    }

    private toBuffer(workbook: Workbook): Promise<Buffer> {
        return workbook.outputAsync({ type: "nodebuffer" });
    }
}

function isCell(element: any): element is Cell {
    return element?.constructor?.name === "Cell";
}

function buildRangeRef(range: Range): RangeRef {
    return {
        type: "range",
        sheet: range.sheet().name(),
        start: buildCellAddress(range.startCell()),
        end: buildCellAddress(range.endCell()),
    };
}

function buildCellRef(cell: Cell): CellRef {
    return {
        type: "cell",
        sheet: cell.sheet().name(),
        address: buildCellAddress(cell),
    };
}

function buildCellContents(cell: Cell): CellContents {
    return cell.formula()
        ? { type: "formula", value: cell.formula() }
        : { type: "text", value: formatValue(cell.value()) };
}

function buildCellAddress(cell: Cell): Address {
    return { row: cell.rowNumber() - 1, column: cell.columnNumber() - 1 };
}

function formatValue(value?: string | number | boolean | Date): string {
    if (value instanceof Date) return value.toISOString();
    return value !== undefined ? String(value) : "";
}

function getOrCreateSheet(workbook: Workbook, name: string): Sheet {
    const sheet = workbook.sheet(name);
    if (!sheet) return workbook.addSheet(name);
    return sheet;
}

function parseLocation(sheet: Sheet, ref: CellRef | RangeRef) {
    if (ref.type === "range") {
        return sheet.range(ref.start.row + 1, ref.start.column + 1, ref.end.row + 1, ref.end.column + 1).merged(true);
    } else {
        return sheet.cell(ref.address.row + 1, ref.address.column + 1);
    }
}
