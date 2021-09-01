import { FormulaVariable } from "../entities/FormulaVariable";
import { FutureData } from "../entities/Future";

export interface FormulaVariableRepository {
    get(): FutureData<FormulaVariable[]>;
}
