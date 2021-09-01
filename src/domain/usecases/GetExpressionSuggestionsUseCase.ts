import { UseCase } from "../../compositionRoot";
import { FormulaVariable } from "../entities/FormulaVariable";
import { FutureData } from "../entities/Future";
import { FormulaVariableRepository } from "../repositories/FormulaVariableRepository";

export class GetExpressionSuggestionsUseCase implements UseCase {
    constructor(private formulaRepository: FormulaVariableRepository) {}

    public execute(): FutureData<FormulaVariable[]> {
        return this.formulaRepository.get();
    }
}
