import _ from "lodash";
import { Future, FutureData } from "../domain/entities/Future";
import { Instance } from "../domain/entities/Instance";
import { Metadata, MetadataPackage, MetadataType } from "../domain/entities/Metadata";
import { MetadataRepository } from "../domain/repositories/MetadataRepository";
import { D2Api, Pager } from "../types/d2-api";
import { cache } from "../utils/cache";
import { getD2APiFromInstance, getFieldsAsString, getFilterAsString } from "./utils/d2-api";
import { apiToFuture } from "./utils/futures";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public list(
        type: MetadataType,
        options: { pageSize?: number; page?: number; filter?: string },
        fieldOptions: {}
    ): FutureData<{ pager: Pager; objects: Metadata[] }> {
        return apiToFuture(
            //@ts-ignore
            this.api.models[type].get({
                filter: options.filter ? { identifiable: { token: options.filter } } : undefined,
                fields: { ...fieldOptions, id: true, name: true, code: true },
                pageSize: options.pageSize ?? 25,
                page: options.page ?? 1,
            })
        );
    }

    public listAll(
        types: MetadataType[],
        fields = { id: true, name: true, code: true },
        filter?: string
    ): FutureData<MetadataPackage> {
        const params = _.zipObject(
            types,
            types.map(() => ({ fields, filter }))
        );

        return apiToFuture(this.api.metadata.get(params));
    }

    @cache()
    public async search(type: MetadataType, query: string): Promise<Metadata | undefined> {
        const { objects: exact } = await this.api.models[type]
            //@ts-ignore D2-api index bug
            .get({
                fields: { id: true, name: true },
                filter: { identifiable: { eq: query } },
                paging: false,
            })
            .getData();

        if (exact.length === 1) return exact[0];

        const { objects: similar } = await this.api.models[type]
            //@ts-ignore D2-api index bug
            .get({
                fields: { id: true, name: true },
                filter: { identifiable: { token: query } },
                paging: false,
            })
            .getData();

        return similar[0];
    }

    public lookup(queries: string[]): FutureData<MetadataPackage> {
        const metadataById = apiToFuture(
            this.api.get<MetadataPackage>("/metadata", {
                fields: getFieldsAsString({ id: true, name: true, shortName: true, code: true }),
                filter: getFilterAsString({ id: { in: queries } }),
                paging: false,
            })
        );

        const metadataByCode = apiToFuture(
            this.api.get<MetadataPackage>("/metadata", {
                fields: getFieldsAsString({ id: true, name: true, shortName: true, code: true }),
                filter: getFilterAsString({ code: { in: queries } }),
                paging: false,
            })
        );

        const metadataByName = apiToFuture(
            this.api.get<MetadataPackage>("/metadata", {
                fields: getFieldsAsString({ id: true, name: true, shortName: true, code: true }),
                filter: getFilterAsString({ name: { in: queries } }),
                paging: false,
            })
        );

        return Future.joinObj({ metadataById, metadataByCode, metadataByName }).map(
            ({ metadataById, metadataByCode, metadataByName }) => {
                const candidates = [metadataById, metadataByCode, metadataByName];

                const listItems = (key: MetadataType) =>
                    _(candidates)
                        .flatMap(item => item[key])
                        .compact()
                        .uniqBy(item => item.id)
                        .value();

                return _(candidates)
                    .flatMap(item => _.keys(item))
                    .filter(key => key !== "system")
                    .compact()
                    .uniq()
                    .map((key: MetadataType) => [key, listItems(key)])
                    .fromPairs()
                    .value() as MetadataPackage;
            }
        );
    }
}
