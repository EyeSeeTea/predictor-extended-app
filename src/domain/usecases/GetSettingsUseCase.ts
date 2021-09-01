import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { Settings } from "../entities/Settings";
import { SettingsRepository } from "../repositories/SettingsRepository";

export class GetSettingsUseCase implements UseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(): FutureData<Settings> {
        return this.settingsRepository.get();
    }
}
