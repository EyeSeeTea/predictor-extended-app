import { TableSorting } from "@eyeseetea/d2-ui-components";
import { UseCase } from "../../compositionRoot";
import { Pager } from "../../types/d2-api";
import { FutureData } from "../entities/Future";
import { PredictorDetails } from "../entities/Predictor";
import { ListPredictorsFilters, PredictorRepository } from "../repositories/PredictorRepository";

export class ListPredictorsUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(
        filters?: ListPredictorsFilters,
        paging?: { page?: number; pageSize?: number; paging?: false },
        sorting?: TableSorting<PredictorDetails>
    ): FutureData<{
        pager: Pager;
        objects: PredictorDetails[];
    }> {
        return this.predictorRepository.list(filters, paging, sorting);
    }
}
