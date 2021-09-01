import { D2Api } from "../../../types/d2-api";
import { MigrationTasks } from "../client/types";
import migrationTask1 from "./01.scheduling-reset";

export function getMigrationTasks(): MigrationTasks<MigrationParams> {
    return [[1, migrationTask1]];
}

export interface MigrationParams {
    d2Api: D2Api;
}
