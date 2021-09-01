import { NamedRef, Ref, SharingSetting } from "../../domain/entities/DHIS2";
import { Codec, Schema } from "../utils/codec";

export const RefModel: Codec<Ref> = Schema.object({
    id: Schema.string,
});

export const NamedRefModel: Codec<NamedRef> = Schema.object({
    id: Schema.string,
    name: Schema.optionalSafe(Schema.string, "Unknown"),
});

export const SharingSettingModel: Codec<SharingSetting> = Schema.object({
    access: Schema.string,
    displayName: Schema.optionalSafe(Schema.string, "Unknown"),
    id: Schema.string,
});
