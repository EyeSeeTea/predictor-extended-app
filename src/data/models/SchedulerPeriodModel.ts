import { PeriodObject, SchedulerPeriod } from "../../domain/entities/SchedulerPeriod";
import { Codec, Schema } from "../utils/codec";

export const SchedulerPeriodModel: Codec<SchedulerPeriod> = Schema.oneOf([
    Schema.exact("FIXED"),
    Schema.exact("TODAY"),
    Schema.exact("YESTERDAY"),
    Schema.exact("LAST_7_DAYS"),
    Schema.exact("LAST_14_DAYS"),
    Schema.exact("THIS_WEEK"),
    Schema.exact("LAST_WEEK"),
    Schema.exact("THIS_MONTH"),
    Schema.exact("LAST_MONTH"),
    Schema.exact("THIS_QUARTER"),
    Schema.exact("LAST_QUARTER"),
    Schema.exact("THIS_YEAR"),
    Schema.exact("LAST_YEAR"),
]);

export const PeriodObjectModel: Codec<PeriodObject> = Schema.object({
    type: SchedulerPeriodModel,
    startDate: Schema.optional(Schema.date),
    endDate: Schema.optional(Schema.date),
});
