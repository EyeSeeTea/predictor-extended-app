import { UseCase } from "../../compositionRoot";
import { PredictorRepository } from "../repositories/PredictorRepository";

export class DeletePredictorsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public async execute(ids: string[]): Promise<unknown> {
        return this.predictorRepository.delete(ids);
    }
}
