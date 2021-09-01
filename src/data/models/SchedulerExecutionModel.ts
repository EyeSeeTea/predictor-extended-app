import { SchedulerExecution } from "../../domain/entities/SchedulerExecution";
import { RunPredictorsResponse } from "../../domain/repositories/PredictorRepository";
import { Codec, Schema } from "../utils/codec";

export const RunPredictorsResponseModel: Codec<RunPredictorsResponse> = Schema.object({
    id: Schema.string,
    name: Schema.string,
    status: Schema.oneOf([Schema.exact("OK"), Schema.exact("ERROR")]),
    message: Schema.string,
});

export const SchedulerExecutionModel: Codec<SchedulerExecution> = Schema.object({
    lastExecutionDuration: Schema.optional(Schema.number),
    lastExecution: Schema.optional(Schema.date),
    nextExecution: Schema.optional(Schema.date),
    results: Schema.optional(Schema.array(RunPredictorsResponseModel)),
});
