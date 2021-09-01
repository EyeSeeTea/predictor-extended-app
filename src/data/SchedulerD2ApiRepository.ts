import { Future, FutureData } from "../domain/entities/Future";
import { SchedulerExecution } from "../domain/entities/SchedulerExecution";
import { SchedulerRepository } from "../domain/repositories/SchedulerRepository";
import { Namespaces, StorageRepository } from "../domain/repositories/StorageRepository";
import { SchedulerExecutionModel } from "./models/SchedulerExecutionModel";

export class SchedulerD2ApiRepository implements SchedulerRepository {
    constructor(private storageRepository: StorageRepository) {}

    public updateLastExecution(execution: SchedulerExecution): FutureData<void> {
        const data = SchedulerExecutionModel.encode<SchedulerExecution>(execution);
        return this.storageRepository.saveObject<SchedulerExecution>(Namespaces.SCHEDULER_EXECUTIONS, data);
    }

    public getLastExecution(): FutureData<SchedulerExecution> {
        return this.storageRepository
            .getObject<SchedulerExecution>(Namespaces.SCHEDULER_EXECUTIONS, {})
            .flatMap(data => Future.fromPurifyEither(SchedulerExecutionModel.decode(data)));
    }
}
