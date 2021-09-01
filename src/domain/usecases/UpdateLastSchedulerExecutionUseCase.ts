import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { SchedulerExecution } from "../entities/SchedulerExecution";
import { SchedulerRepository } from "../repositories/SchedulerRepository";

export class UpdateLastSchedulerExecutionUseCase implements UseCase {
    constructor(private userRepository: SchedulerRepository) {}

    public execute(execution: SchedulerExecution): FutureData<void> {
        return this.userRepository.updateLastExecution(execution);
    }
}
