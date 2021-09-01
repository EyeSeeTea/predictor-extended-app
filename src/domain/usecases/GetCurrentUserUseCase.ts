import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

export class GetCurrentUserUseCase {
    constructor(private userRepository: UserRepository) {}

    execute(): Promise<User> {
        return this.userRepository.getCurrent();
    }
}
