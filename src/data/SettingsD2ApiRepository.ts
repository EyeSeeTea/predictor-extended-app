import { Future, FutureData } from "../domain/entities/Future";
import { Settings } from "../domain/entities/Settings";
import { SettingsRepository } from "../domain/repositories/SettingsRepository";
import { Namespaces, StorageRepository } from "../domain/repositories/StorageRepository";
import { SettingsModel } from "./models/SettingsModel";

export class SettingsD2ApiRepository implements SettingsRepository {
    constructor(private storageRepository: StorageRepository) {}

    public get(): FutureData<Settings> {
        return this.storageRepository
            .getObject(Namespaces.SETTINGS, { scheduling: {} })
            .flatMap(data => Future.fromPurifyEither(SettingsModel.decode(data)));
    }

    public save(settings: Settings): FutureData<void> {
        const data = SettingsModel.encode<Settings>(settings);
        return this.storageRepository.saveObject(Namespaces.SETTINGS, data);
    }
}
