export interface Ref {
    id: string;
}

export interface NamedRef extends Ref {
    name: string;
}

export type AttributeValue = {
    attribute: Ref;
    created: string;
    lastUpdated: string;
    value: string;
};

export type SharingSetting = {
    access: string;
    displayName: string;
    id: string;
};
