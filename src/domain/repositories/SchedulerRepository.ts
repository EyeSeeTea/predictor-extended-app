import { FutureData } from "../entities/Future";
import { SchedulerExecution } from "../entities/SchedulerExecution";

export interface SchedulerRepository {
    updateLastExecution(execution: SchedulerExecution): FutureData<void>;
    getLastExecution(): FutureData<SchedulerExecution>;
}
