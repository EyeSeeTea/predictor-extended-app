import { Future, FutureData } from "../domain/entities/Future";
import { Instance, UserSearch } from "../domain/entities/Instance";
import { InstanceRepository } from "../domain/repositories/InstanceRepository";
import { D2Api } from "../types/d2-api";
import { getD2APiFromInstance } from "./utils/d2-api";
import { apiToFuture } from "./utils/futures";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public searchUsers(query: string): FutureData<UserSearch> {
        const users$ = apiToFuture(this.api.models.users.get({ fields, query, paging: false }));
        const userGroups$ = apiToFuture(
            this.api.models.userGroups.get({ fields, filter: { identifiable: { ilike: query } }, paging: false })
        );

        return Future.join2(users$, userGroups$).map(([{ objects: users }, { objects: userGroups }]) => ({
            users,
            userGroups,
        }));
    }
}

const asName = { $fn: { name: "rename", to: "name" } } as const;
const fields = { id: true, displayName: asName };
