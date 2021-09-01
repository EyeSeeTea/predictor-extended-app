import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { buildPeriodDate, PeriodObject } from "../entities/SchedulerPeriod";
import { PredictorRepository, RunPredictorsResponse } from "../repositories/PredictorRepository";

export class RunPredictorsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(predictors: string[], period: PeriodObject, delay?: number): FutureData<RunPredictorsResponse[]> {
        const { startDate, endDate } = buildPeriodDate(period);
        return this.predictorRepository.run(predictors, startDate, endDate, delay);
    }
}
