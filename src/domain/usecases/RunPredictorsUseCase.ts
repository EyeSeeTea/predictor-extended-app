import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { PredictorRepository, RunPredictorsResponse } from "../repositories/PredictorRepository";

export class RunPredictorsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(predictors: string[]): FutureData<RunPredictorsResponse[]> {
        // TODO: FIXME real dates
        return this.predictorRepository.run(predictors, new Date("1970-01-01"), new Date("2022-01-01"));
    }
}
