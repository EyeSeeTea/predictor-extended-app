import { Instance } from "../domain/entities/Instance";
import { User } from "../domain/entities/User";
import { UserRepository } from "../domain/repositories/UserRepository";
import { D2Api } from "../types/d2-api";
import { getD2APiFromInstance } from "./utils/d2-api";

export class UserD2ApiRepository implements UserRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    async getCurrent(): Promise<User> {
        const currentUser = await this.api.currentUser
            .get({
                fields: { id: true, name: true, authorities: true },
            })
            .getData();

        return User.create(currentUser);
    }
}
