import { UseCase } from "../../compositionRoot";
import { Pager } from "../../types/d2-api";
import { FutureData } from "../entities/Future";
import { Metadata, MetadataType } from "../entities/Metadata";
import { MetadataRepository } from "../repositories/MetadataRepository";

export class ListMetadataUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(
        type: MetadataType,
        options: { pageSize?: number; page?: number; filter?: object; paging?: boolean } = {},
        fields: {} = {}
    ): FutureData<{ pager: Pager; objects: Metadata[] }> {
        const { paging = true } = options;

        if (paging) {
            return this.metadataRepository.list(type, options, fields);
        } else {
            return this.metadataRepository.listAll([type], fields, options.filter).map(metadata => ({
                pager: { page: 1, pageCount: 1, pageSize: metadata[type]?.length, total: metadata[type]?.length },
                objects: metadata[type] ?? [],
            }));
        }
    }
}
