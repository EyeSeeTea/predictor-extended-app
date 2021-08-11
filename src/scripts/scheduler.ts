import { ArgumentParser } from "argparse";
import fs from "fs";
import _ from "lodash";
import { configure, getLogger } from "log4js";
import { CompositionRoot, getCompositionRoot } from "../compositionRoot";
import { Future, FutureData } from "../domain/entities/Future";
import { PredictorDetails } from "../domain/entities/Predictor";
import { Settings } from "../domain/entities/Settings";
import { ConfigModel, SchedulerConfig } from "./entities/SchedulerConfig";

const development = process.env.NODE_ENV === "development";

configure({
    appenders: {
        out: { type: "stdout" },
        file: { type: "file", filename: "debug.log" },
    },
    categories: { default: { appenders: ["file", "out"], level: development ? "all" : "debug" } },
});

function runPredictors(settings: Settings, predictors: PredictorDetails[]) {
    const orderedPredictors = _.sortBy(predictors, ["scheduling.sequence", "scheduling.variable", "id"]);
    getLogger("main").info(settings, orderedPredictors);
}

const checkMigrations = (compositionRoot: CompositionRoot): FutureData<boolean> => {
    return Future.fromPromise(compositionRoot.migrations.hasPending()).mapError(() => {
        return "There are pending migrations, unable to continue";
    });
};

function parseConfig(config: SchedulerConfig) {
    Future.futureMap(
        config.instances,
        instance => {
            const compositionRoot = getCompositionRoot(instance);

            return checkMigrations(compositionRoot)
                .flatMap(() =>
                    Future.joinObj({
                        predictors: compositionRoot.predictors.list(undefined, { paging: false }),
                        settings: compositionRoot.settings.get(),
                    })
                )
                .map(({ settings, predictors: { objects } }) => runPredictors(settings, objects))
                .mapError(error => `[${instance.url}] ${error}`);
        },
        {
            catchErrors: error => getLogger("main").error(error),
        }
    ).run(
        result => getLogger("main").info({ result }),
        error => getLogger("main").error(error)
    );
}

async function main() {
    const parser = new ArgumentParser({
        description: "Scheduler to execute predictors on multiple DHIS2 instances",
    });

    parser.add_argument("-c", "--config", {
        required: true,
        help: "Configuration file",
    });

    try {
        const args = parser.parse_args();
        const text = fs.readFileSync(args.config, "utf8");
        const contents = JSON.parse(text);
        const config = ConfigModel.unsafeDecode(contents);
        parseConfig(config);
    } catch (err) {
        getLogger("main").fatal(err);
        process.exit(1);
    }
}

main();
