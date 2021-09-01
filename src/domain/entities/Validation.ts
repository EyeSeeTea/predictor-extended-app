export interface Validation<T extends string> {
    id: string;
    error: T;
    description: string;
}
