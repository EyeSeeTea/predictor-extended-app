import { RunPredictorsResponse } from "../repositories/PredictorRepository";

export interface SchedulerExecution {
    lastExecutionDuration?: number;
    lastExecution?: Date;
    nextExecution?: Date;
    results?: RunPredictorsResponse[];
}
