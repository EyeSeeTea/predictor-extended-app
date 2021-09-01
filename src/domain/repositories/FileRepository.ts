import { File } from "../entities/File";

export interface FileRepository {
    download(file: File): void;
}
