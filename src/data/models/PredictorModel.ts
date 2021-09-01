import { Formula, PeriodType, PredictorDetails, Predictor, Scheduling } from "../../domain/entities/Predictor";
import { Codec, Schema } from "../utils/codec";
import { NamedRefModel } from "./DHIS2Model";

export const FormulaModel: Codec<Formula> = Schema.object({
    expression: Schema.nonEmptyString,
    description: Schema.optionalSafe(Schema.string, "Description"),
    slidingWindow: Schema.optionalSafe(Schema.boolean, false),
    missingValueStrategy: Schema.optionalSafe(
        Schema.oneOf([
            Schema.exact("NEVER_SKIP"),
            Schema.exact("SKIP_IF_ANY_VALUE_MISSING"),
            Schema.exact("SKIP_IF_ALL_VALUES_MISSING"),
        ]),
        "SKIP_IF_ALL_VALUES_MISSING"
    ),
});

export const SchedulingModel: Codec<Scheduling> = Schema.object({
    sequence: Schema.number,
    variable: Schema.number,
});

export const PeriodTypeModel: Codec<PeriodType> = Schema.oneOf([
    Schema.exact("Daily"),
    Schema.exact("Weekly"),
    Schema.exact("WeeklyWednesday"),
    Schema.exact("WeeklyThursday"),
    Schema.exact("WeeklySaturday"),
    Schema.exact("WeeklySunday"),
    Schema.exact("BiWeekly"),
    Schema.exact("Monthly"),
    Schema.exact("BiMonthly"),
    Schema.exact("Quarterly"),
    Schema.exact("SixMonthly"),
    Schema.exact("SixMonthlyApril"),
    Schema.exact("SixMonthlyNov"),
    Schema.exact("Yearly"),
    Schema.exact("FinancialApril"),
    Schema.exact("FinancialJuly"),
    Schema.exact("FinancialOct"),
    Schema.exact("FinancialNov"),
]);

export const PredictorDetailsModel: Codec<PredictorDetails> = Schema.object({
    id: Schema.nonEmptyString,
    code: Schema.optional(Schema.string),
    name: Schema.nonEmptyString,
    description: Schema.optional(Schema.string),
    output: NamedRefModel,
    outputCombo: Schema.optional(NamedRefModel),
    periodType: PeriodTypeModel,
    organisationUnitLevels: Schema.optionalSafe(Schema.array(NamedRefModel), []),
    generator: FormulaModel,
    sampleSkipTest: Schema.optional(FormulaModel),
    sequentialSampleCount: Schema.number,
    annualSampleCount: Schema.number,
    sequentialSkipCount: Schema.optional(Schema.number),
    predictorGroups: Schema.optionalSafe(Schema.array(NamedRefModel), []),
    lastUpdated: Schema.string,
    lastUpdatedBy: NamedRefModel,
    created: Schema.string,
    user: NamedRefModel,
    scheduling: SchedulingModel,
});

export const PredictorModel: Codec<Predictor> = Schema.object({
    id: Schema.nonEmptyString,
    code: Schema.optional(Schema.string),
    name: Schema.nonEmptyString,
    description: Schema.optional(Schema.string),
    output: NamedRefModel,
    outputCombo: Schema.optional(NamedRefModel),
    periodType: PeriodTypeModel,
    organisationUnitLevels: Schema.optionalSafe(Schema.array(NamedRefModel), []),
    generator: FormulaModel,
    sampleSkipTest: Schema.optional(FormulaModel),
    sequentialSampleCount: Schema.number,
    annualSampleCount: Schema.number,
    sequentialSkipCount: Schema.optional(Schema.number),
    predictorGroups: Schema.optionalSafe(Schema.array(NamedRefModel), []),
    scheduling: SchedulingModel,
});
