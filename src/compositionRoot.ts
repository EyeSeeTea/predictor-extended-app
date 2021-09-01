import { ExcelXlsxPopulateRepository } from "./data/ExcelXlsxPopulateRepository";
import { FileBrowserRepository } from "./data/FileBrowserRepository";
import { FormulaVariableD2ApiRepository } from "./data/FormulaVariableD2ApiRepository";
import { InstanceD2ApiRepository } from "./data/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "./data/MetadataD2ApiRepository";
import { PredictorD2ApiRepository } from "./data/PredictorD2ApiRepository";
import { SettingsD2ApiRepository } from "./data/SettingsD2ApiRepository";
import { StorageDataStoreRepository } from "./data/StorageDataStoreRepository";
import { UserD2ApiRepository } from "./data/UserD2ApiRepository";
import { DeletePredictorsUseCase } from "./domain/usecases/DeletePredictorsUseCase";
import { ExportPredictorsUseCase } from "./domain/usecases/ExportPredictorsUseCase";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { GetExpressionSuggestionsUseCase } from "./domain/usecases/GetExpressionSuggestionsUseCase";
import { GetOutputDataElementsUseCase } from "./domain/usecases/GetOutputDataElementsUseCase";
import { GetPredictorGroupsUseCase } from "./domain/usecases/GetPredictorGroupsUseCase";
import { GetPredictorsUseCase } from "./domain/usecases/GetPredictorsUseCase";
import { GetSettingsUseCase } from "./domain/usecases/GetSettingsUseCase";
import { ListMetadataUseCase } from "./domain/usecases/ListMetadataUseCase";
import { ListPredictorsUseCase } from "./domain/usecases/ListPredictorsUseCase";
import { ReadPredictorsExcelUseCase } from "./domain/usecases/ReadPredictorsExcelUseCase";
import { RunPredictorsUseCase } from "./domain/usecases/RunPredictorsUseCase";
import { SavePredictorsUseCase } from "./domain/usecases/SavePredictorsUseCase";
import { SaveSettingsUseCase } from "./domain/usecases/SaveSettingsUseCase";
import { SearchUsersUseCase } from "./domain/usecases/SearchUsersUseCase";
import { ValidateExpressionUseCase } from "./domain/usecases/ValidateExpressionUseCase";

export function getCompositionRoot(baseUrl: string) {
    const storageRepository = new StorageDataStoreRepository(baseUrl);
    const settingsRepository = new SettingsD2ApiRepository(storageRepository);
    const predictorRepository = new PredictorD2ApiRepository(baseUrl, storageRepository);
    const metadataRepository = new MetadataD2ApiRepository(baseUrl);
    const instanceRepository = new InstanceD2ApiRepository(baseUrl);
    const excelRepository = new ExcelXlsxPopulateRepository();
    const fileRepository = new FileBrowserRepository();
    const formulaVariableRepository = new FormulaVariableD2ApiRepository(baseUrl);
    const userRepository = new UserD2ApiRepository(baseUrl);

    return {
        predictors: getExecute({
            get: new GetPredictorsUseCase(predictorRepository),
            list: new ListPredictorsUseCase(predictorRepository),
            getGroups: new GetPredictorGroupsUseCase(predictorRepository),
            getDataElements: new GetOutputDataElementsUseCase(predictorRepository),
            run: new RunPredictorsUseCase(predictorRepository),
            delete: new DeletePredictorsUseCase(predictorRepository),
            save: new SavePredictorsUseCase(predictorRepository),
            export: new ExportPredictorsUseCase(
                predictorRepository,
                excelRepository,
                fileRepository,
                metadataRepository
            ),
            readExcel: new ReadPredictorsExcelUseCase(excelRepository, metadataRepository),
        }),
        metadata: getExecute({
            list: new ListMetadataUseCase(metadataRepository),
        }),
        expressions: getExecute({
            getSuggestions: new GetExpressionSuggestionsUseCase(formulaVariableRepository),
            validate: new ValidateExpressionUseCase(predictorRepository),
        }),
        users: getExecute({
            getCurrent: new GetCurrentUserUseCase(userRepository),
            search: new SearchUsersUseCase(instanceRepository),
        }),
        settings: getExecute({
            get: new GetSettingsUseCase(settingsRepository),
            save: new SaveSettingsUseCase(settingsRepository),
        }),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}

export interface UseCase {
    execute: Function;
}
