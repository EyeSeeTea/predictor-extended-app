import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { PredictorDetails } from "../entities/Predictor";
import { PredictorRepository } from "../repositories/PredictorRepository";

export class GetPredictorsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(ids: string[]): FutureData<PredictorDetails[]> {
        return this.predictorRepository.get(ids);
    }
}
