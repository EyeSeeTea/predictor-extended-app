import { Future, FutureData } from "../domain/entities/Future";
import { StorageRepository } from "../domain/repositories/StorageRepository";
import { D2Api, DataStore } from "../types/d2-api";
import { getD2APiFromUrl } from "./utils/d2-api";
import { toFuture } from "./utils/futures";

const dataStoreNamespace = "predictor-extended";

export class StorageDataStoreRepository extends StorageRepository {
    private api: D2Api;
    private dataStore: DataStore;

    constructor(baseUrl: string) {
        super();
        this.api = getD2APiFromUrl(baseUrl);
        this.dataStore = this.api.dataStore(dataStoreNamespace);
    }

    public getObject<T extends object>(key: string, defaultValue: T): FutureData<T> {
        return toFuture(this.dataStore.get<T>(key)).flatMap(value => {
            if (value !== undefined) return Future.success(value);
            return this.saveObject(key, defaultValue).map(() => defaultValue);
        });
    }

    public getObjectIfExists<T extends object>(key: string): FutureData<T | undefined> {
        return toFuture(this.dataStore.get<T>(key));
    }

    public listKeys(): FutureData<string[]> {
        return toFuture(this.dataStore.getKeys());
    }

    public saveObject<T extends object>(key: string, value: T): FutureData<void> {
        return toFuture(this.dataStore.save(key, value));
    }

    public removeObject(key: string): FutureData<boolean> {
        return toFuture(this.dataStore.delete(key));
    }
}
