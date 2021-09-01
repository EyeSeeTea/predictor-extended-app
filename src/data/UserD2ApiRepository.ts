import { User } from "../domain/entities/User";
import { UserRepository } from "../domain/repositories/UserRepository";
import { D2Api } from "../types/d2-api";
import { getD2APiFromUrl } from "./utils/d2-api";

export class UserD2ApiRepository implements UserRepository {
    private api: D2Api;

    constructor(baseUrl: string) {
        this.api = getD2APiFromUrl(baseUrl);
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
