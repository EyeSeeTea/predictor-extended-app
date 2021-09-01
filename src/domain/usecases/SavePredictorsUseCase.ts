import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { MetadataResponse } from "../entities/Metadata";
import { Predictor } from "../entities/Predictor";
import { PredictorRepository } from "../repositories/PredictorRepository";

export class SavePredictorsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(predictors: Predictor[]): FutureData<MetadataResponse[]> {
        return this.predictorRepository.save(predictors);
    }
}
