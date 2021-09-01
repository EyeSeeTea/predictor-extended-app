export type File = ExcelFile;

export interface ExcelFile {
    type: "excel";
    name: string;
    buffer: Buffer;
}
