import { UseCase } from "../../compositionRoot";
import { Debug } from "../entities/Debug";
import { MigrationsRepository } from "../repositories/MigrationsRepository";
import { UserRepository } from "../repositories/UserRepository";

export class RunMigrationsUseCase implements UseCase {
    constructor(private migrationsRepository: MigrationsRepository, private userRepository: UserRepository) {}

    public async execute(debug: Debug): Promise<void> {
        const currentUser = await this.userRepository.getCurrent();
        if (!currentUser.authorities.includes("ALL")) {
            throw new Error("Only a user with authority ALL can run this migration");
        }

        await this.migrationsRepository.runMigrations(debug);
    }
}
