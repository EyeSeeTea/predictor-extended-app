import { ExcelModel } from "../entities/Excel";

export interface ExcelRepository {
    createFile(): Promise<Buffer>;
    readFile(buffer: Buffer | ArrayBuffer, options?: ReadOptions): Promise<ExcelModel>;
    writeFile(input: Buffer | ArrayBuffer, file: ExcelModel, options?: WriteOptions): Promise<Buffer>;
}

export interface ReadOptions {}
export interface WriteOptions {}
