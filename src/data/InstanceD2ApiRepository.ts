import { Future, FutureData } from "../domain/entities/Future";
import { UserSearch } from "../domain/entities/Instance";
import { InstanceRepository } from "../domain/repositories/InstanceRepository";
import { D2Api } from "../types/d2-api";
import { getD2APiFromUrl } from "./utils/d2-api";
import { toFuture } from "./utils/futures";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    constructor(baseUrl: string) {
        this.api = getD2APiFromUrl(baseUrl);
    }

    public searchUsers(query: string): FutureData<UserSearch> {
        const users$ = toFuture(this.api.models.users.get({ fields, query, paging: false }));
        const userGroups$ = toFuture(
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
