import { NamedRef } from "./DHIS2";

export interface Instance {
    url: string;
    username?: string;
    password?: string;
}

export interface UserSearch {
    users: NamedRef[];
    userGroups: NamedRef[];
}
