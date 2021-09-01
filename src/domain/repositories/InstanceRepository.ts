import { FutureData } from "../entities/Future";
import { UserSearch } from "../entities/Instance";

export interface InstanceRepository {
    searchUsers(query: string): FutureData<UserSearch>;
}
