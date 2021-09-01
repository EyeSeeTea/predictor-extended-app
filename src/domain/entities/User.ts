interface UserData {
    id: string;
    name: string;
    authorities: string[];
}

export class User {
    readonly id: string;
    readonly name: string;
    readonly authorities: string[];
    readonly isAdmin: boolean;

    private constructor({ id, name, authorities }: UserData) {
        this.id = id;
        this.name = name;
        this.authorities = authorities;
        this.isAdmin = authorities.includes("ALL");
    }

    public static create(data: UserData) {
        return new User(data);
    }
}
