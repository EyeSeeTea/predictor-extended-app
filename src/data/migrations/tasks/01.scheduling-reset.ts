import { MigrationParams } from ".";
import { Debug } from "../../../domain/entities/Debug";
import { Settings } from "../../../domain/entities/Settings";
import { Namespaces } from "../../../domain/repositories/StorageRepository";
import { AppStorage, Migration } from "../client/types";

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const prevSettings = (await storage.get<Settings>(Namespaces.SETTINGS)) ?? {};

    await storage.save<Settings>(Namespaces.SETTINGS, {
        ...prevSettings,
        scheduling: { enabled: false },
    });
}

const migration: Migration<MigrationParams> = { name: "Update settings permissions", migrate };

export default migration;
