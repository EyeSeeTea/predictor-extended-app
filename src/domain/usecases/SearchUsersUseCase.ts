import { UseCase } from "../../compositionRoot";
import { FutureData } from "../entities/Future";
import { UserSearch } from "../entities/Instance";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class SearchUsersUseCase implements UseCase {
    constructor(private userRepository: InstanceRepository) {}

    public execute(query: string): FutureData<UserSearch> {
        return this.userRepository.searchUsers(query);
    }
}
