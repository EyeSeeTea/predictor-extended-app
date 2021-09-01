import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { Settings } from "../entities/Settings";
import { SettingsRepository } from "../repositories/SettingsRepository";

export class SaveSettingsUseCase implements UseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(settings: Settings): FutureData<void> {
        return this.settingsRepository.save(settings);
    }
}
