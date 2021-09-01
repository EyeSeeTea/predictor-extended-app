import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { ExpressionType, ExpressionValidation, PredictorRepository } from "../repositories/PredictorRepository";

export class ValidateExpressionUseCase implements UseCase {
    constructor(private predictorRepository: PredictorRepository) {}

    public execute(type: ExpressionType, expression: string): FutureData<ExpressionValidation> {
        return this.predictorRepository.validateExpression(type, expression);
    }
}
