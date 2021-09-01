import { TableSorting } from "@eyeseetea/d2-ui-components";
import { Pager } from "../../types/d2-api";
import { NamedRef } from "../entities/DHIS2";
import { FutureData } from "../entities/Future";
import { MetadataResponse } from "../entities/Metadata";
import { PredictorDetails, Predictor } from "../entities/Predictor";

export interface PredictorRepository {
    get(ids: string[]): FutureData<PredictorDetails[]>;

    list(
        filters?: ListPredictorsFilters,
        paging?: { page?: number; pageSize?: number; paging?: false },
        sorting?: TableSorting<PredictorDetails>
    ): FutureData<{ pager: Pager; objects: PredictorDetails[] }>;

    getGroups(): FutureData<NamedRef[]>;

    getAllIds(): FutureData<string[]>;

    getOutputDataElements(): FutureData<NamedRef[]>;

    run(ids: string[], startDate: Date, endDate: Date, delay?: number): FutureData<RunPredictorsResponse[]>;

    save(predictors: Predictor[]): FutureData<MetadataResponse[]>;

    delete(ids: string[]): FutureData<void>;

    validateExpression(type: ExpressionType, expression: string): FutureData<ExpressionValidation>;
}

export type ExpressionType = "predictor-formula" | "predictor-skip-test";

export interface ExpressionValidation {
    message: string;
    description: string;
    status: "OK" | "ERROR";
}

export interface ListPredictorsFilters {
    search?: string;
    predictorGroups?: string[];
    dataElements?: string[];
    lastUpdated?: string;
}

export interface RunPredictorsResponse {
    id: string;
    name: string;
    status: "OK" | "ERROR";
    message: string;
}
