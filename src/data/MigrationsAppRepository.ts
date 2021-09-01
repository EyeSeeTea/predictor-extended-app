import { Debug } from "../domain/entities/Debug";
import { Instance } from "../domain/entities/Instance";
import { MigrationVersions } from "../domain/entities/MigrationVersions";
import { MigrationsRepository } from "../domain/repositories/MigrationsRepository";
import { StorageRepository } from "../domain/repositories/StorageRepository";
import { D2Api } from "../types/d2-api";
import { cache } from "../utils/cache";
import { promiseMap } from "../utils/promises";
import { MigrationsRunner } from "./migrations/client/MigrationsRunner";
import { AppStorage } from "./migrations/client/types";
import { getMigrationTasks, MigrationParams } from "./migrations/tasks";
import { getD2APiFromInstance } from "./utils/d2-api";

export class MigrationsAppRepository implements MigrationsRepository {
    private d2Api: D2Api;

    constructor(instance: Instance, private storageRepository: StorageRepository) {
        this.d2Api = getD2APiFromInstance(instance);
    }

    public async runMigrations(debug: Debug): Promise<void> {
        const runner = await this.getMigrationsRunner();
        await runner.setDebug(debug).execute();
    }

    public async hasPendingMigrations(): Promise<boolean> {
        const runner = await this.getMigrationsRunner();
        return runner.hasPendingMigrations();
    }

    public async getAppVersion(): Promise<MigrationVersions> {
        const runner = await this.getMigrationsRunner();
        return { appVersion: runner.appVersion, instanceVersion: runner.instanceVersion };
    }

    @cache()
    private async getMigrationsRunner(): Promise<MigrationsRunner<MigrationParams>> {
        const storage = await this.getStorageClient();
        const migrations = await promiseMap(getMigrationTasks(), async ([version, migration]) => ({
            version,
            ...migration,
        }));

        return MigrationsRunner.init<MigrationParams>({
            storage,
            debug: console.debug,
            migrations,
            migrationParams: { d2Api: this.d2Api },
        });
    }

    private async getStorageClient(): Promise<AppStorage> {
        return {
            get: <T extends object>(key: string) => this.storageRepository.getObjectIfExists<T>(key).toPromise(),
            getOrCreate: <T extends object>(key: string, defaultValue: T) =>
                this.storageRepository.getObject<T>(key, defaultValue).toPromise(),
            save: <T extends object>(key: string, value: T) =>
                this.storageRepository.saveObject<T>(key, value).toPromise(),
            remove: (key: string) =>
                this.storageRepository
                    .removeObject(key)
                    .map(() => undefined)
                    .toPromise(),
            listKeys: () => this.storageRepository.listKeys().toPromise(),
        };
    }
}
