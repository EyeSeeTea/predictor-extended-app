import { Settings } from "../../domain/entities/Settings";
import { Codec, Schema } from "../utils/codec";

export const SettingsModel: Codec<Settings> = Schema.object({
    scheduling: Schema.optionalSafe(
        Schema.object({
            recurrence: Schema.optionalSafe(Schema.number, 1),
            delay: Schema.optionalSafe(Schema.number, 0),
        }),
        { recurrence: 1, delay: 0 }
    ),
});
