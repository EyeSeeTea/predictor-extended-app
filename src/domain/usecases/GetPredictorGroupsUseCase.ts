import { UseCase } from "../../compositionRoot";
import { NamedRef } from "../entities/DHIS2";
import { FutureData } from "../entities/Future";
import { PredictorRepository } from "../repositories/PredictorRepository";

export class GetPredictorGroupsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(): FutureData<NamedRef[]> {
        return this.predictorRepository.getGroups();
    }
}
