import _ from "lodash";
import { getLogger } from "log4js";
import moment from "moment";
import schedule from "node-schedule";
import { CompositionRoot } from "../compositionRoot";
import { SchedulerInstance } from "./entities/SchedulerConfig";

const DEFAULT_CODE = "__default__";

export default class Scheduler {
    constructor(private instance: SchedulerInstance, private compositionRoot: CompositionRoot) {}

    private synchronizationTask = async (): Promise<void> => {
        try {
            const startTime = new Date();
            const settings = await this.compositionRoot.settings.get().toPromise();
            if (!settings.scheduling.enabled) return;

            const { objects } = await this.compositionRoot.predictors.list(undefined, { paging: false }).toPromise();
            const { period, delay } = settings.scheduling;
            const ids = objects.map(({ id }) => id);

            getLogger("execution").info(
                `Running predictions for ${ids.length} items with period ${period.type} and delay ${delay}`
            );

            const results = await this.compositionRoot.predictors.run(ids, period, delay).toPromise();
            results.forEach(({ id, status, message }) =>
                getLogger("execution").info(`Executed ${id} ${status}: ${message}`)
            );

            const endTime = new Date();
            const duration = moment.duration(endTime.getTime() - startTime.getTime()).asSeconds();
            getLogger("execution").info(`Executed ${ids.length} items in ${duration} seconds`);

            const nextExecution = schedule.scheduledJobs[settings.scheduling.frequency]?.nextInvocation() ?? startTime;
            await this.compositionRoot.scheduler
                .updateLastExecution({
                    lastExecution: endTime,
                    lastExecutionDuration: duration,
                    results,
                    nextExecution,
                })
                .toPromise();
        } catch (error) {
            getLogger("execution").error(`Failed to run predictions`);
        }
    };

    private fetchTask = async (): Promise<void> => {
        try {
            const settings = await this.compositionRoot.settings.get().toPromise();
            if (!settings.scheduling.enabled) {
                this.cancelExistingJobs();
                return;
            }

            const { frequency } = settings.scheduling;
            const existingJob = schedule.scheduledJobs[frequency];
            if (existingJob) return;

            this.cancelExistingJobs();
            const job = schedule.scheduleJob(frequency, frequency, this.synchronizationTask);
            const nextExecution = job.nextInvocation();
            const nextDate = moment(nextExecution.toISOString()).toISOString(true);
            getLogger("scheduler").info(`Scheduling job at ${nextDate} (${frequency})`);

            const lastExecution = await this.compositionRoot.scheduler.getLastExecution().toPromise();
            await this.compositionRoot.scheduler.updateLastExecution({ ...lastExecution, nextExecution }).toPromise();
        } catch (error) {
            getLogger("scheduler").error(error);
        }
    };

    private cancelExistingJobs(): void {
        const currentJobIds = _.keys(schedule.scheduledJobs);
        const idsToCancel = _.difference(currentJobIds, [DEFAULT_CODE]);
        idsToCancel.forEach((id: string) => {
            getLogger("scheduler").info(`Detected configuration changes. Cancelling old job (${id})`);
            schedule.scheduledJobs[id]?.cancel();
        });
    }

    public initialize(): void {
        // Execute fetch task immediately
        this.fetchTask();

        // Schedule periodic fetch task every minute
        schedule.scheduleJob(DEFAULT_CODE, "0 * * * * *", this.fetchTask);

        getLogger("main").info(
            `Loading configuration for ${this.instance.name} (${this.instance.url}) with user ${this.instance.username}`
        );
    }
}
