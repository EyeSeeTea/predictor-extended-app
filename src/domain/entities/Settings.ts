import { PeriodObject } from "./SchedulerPeriod";

export type SchedulingSettings =
    | { enabled: false }
    | {
          enabled: true;
          frequency: string;
          period: PeriodObject;
          delay: number;
      };

export interface Settings {
    scheduling: SchedulingSettings;
}
