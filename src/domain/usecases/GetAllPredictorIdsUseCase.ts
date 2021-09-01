import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { PredictorRepository } from "../repositories/PredictorRepository";

export class GetAllPredictorIdsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(): FutureData<string[]> {
        return this.predictorRepository.getAllIds();
    }
}
