export interface JobConfiguration {
    id: string;
    name: string;
    jobStatus: string;
    enabled: boolean;
    jobType: "PREDICTOR";
    nextExecutionTime: string;
    schedulingType: "CRON";
    cronExpression: string;
    lastExecutedStatus: "NOT_STARTED";
    jobParameters: JobParameters;
}

export interface JobParameters {
    relativeStart: number;
    relativeEnd: number;
    predictors: string[];
    predictorGroups: string[];
}

export type SaveJobConfiguration = Pick<
    JobConfiguration,
    "id" | "name" | "enabled" | "jobType" | "cronExpression" | "jobParameters"
>;
