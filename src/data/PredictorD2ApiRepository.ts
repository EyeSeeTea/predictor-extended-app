import { TableSorting } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import { NamedRef } from "../domain/entities/DHIS2";
import { Future, FutureData } from "../domain/entities/Future";
import { Predictor, PredictorDetails, SaveScheduling } from "../domain/entities/Predictor";
import {
    ExpressionType,
    ExpressionValidation,
    ListPredictorsFilters,
    PredictorRepository,
} from "../domain/repositories/PredictorRepository";
import { Namespaces, StorageRepository } from "../domain/repositories/StorageRepository";
import { D2Api, MetadataResponse, Pager } from "../types/d2-api";
import { cache } from "../utils/cache";
import { formatDate } from "../utils/dates";
import { PredictorModel } from "./models/PredictorModel";
import { getD2APiFromUrl } from "./utils/d2-api";
import { toFuture } from "./utils/futures";

export class PredictorD2ApiRepository implements PredictorRepository {
    private api: D2Api;

    constructor(baseUrl: string, private storageRepository: StorageRepository) {
        this.api = getD2APiFromUrl(baseUrl);
    }

    @cache()
    public validateExpression(type: ExpressionType, expression: string): FutureData<ExpressionValidation> {
        return toFuture(this.api.expressions.validate(type, expression)).map(({ message, description, status }) => ({
            message,
            description,
            status,
        }));
    }

    public get(ids: string[]): FutureData<PredictorDetails[]> {
        const predictorData$ = toFuture(
            this.api.models.predictors.get({
                filter: { id: { in: ids } },
                paging: false,
                fields: predictorFields,
            })
        );

        const schedulingData$ = this.storageRepository.getObject<SaveScheduling[]>(Namespaces.SCHEDULING, []);

        return Future.join2(predictorData$, schedulingData$).map(([{ objects }, schedulingData]) => {
            return objects.map(item => {
                const scheduling = schedulingData.find(s => s.id === item.id) ?? { sequence: 0, variable: 0 };
                return { ...item, scheduling };
            });
        });
    }

    public list(
        filters?: ListPredictorsFilters,
        paging?: { page: number; pageSize: number },
        sorting?: TableSorting<PredictorDetails>
    ): FutureData<{ pager: Pager; objects: PredictorDetails[] }> {
        const { search, predictorGroups = [], dataElements = [], lastUpdated } = filters ?? {};

        const predictorData$ = toFuture(
            this.api.models.predictors.get({
                filter: {
                    name: search ? { token: search } : undefined,
                    "predictorGroups.id": predictorGroups.length > 0 ? { in: predictorGroups } : undefined,
                    "output.id": dataElements.length > 0 ? { in: dataElements } : undefined,
                    lastUpdated: lastUpdated ? { ge: lastUpdated } : undefined,
                },
                page: paging?.page,
                pageSize: paging?.pageSize,
                order: sorting ? `${sorting.field}:${sorting.order}` : undefined,
                fields: predictorFields,
            })
        );

        const schedulingData$ = this.storageRepository.getObject<SaveScheduling[]>(Namespaces.SCHEDULING, []);

        return Future.join2(predictorData$, schedulingData$).map(([{ objects, pager }, schedulingData]) => {
            return {
                pager,
                objects: objects.map(item => {
                    const scheduling = schedulingData.find(s => s.id === item.id) ?? { sequence: 0, variable: 0 };
                    return { ...item, scheduling };
                }),
            };
        });
    }

    public getGroups(): FutureData<NamedRef[]> {
        return toFuture(
            this.api.models.predictorGroups.get({ paging: false, fields: { id: true, displayName: true } })
        ).map(({ objects }) => {
            return objects.map(({ id, displayName }) => ({ id, name: displayName }));
        });
    }

    public getOutputDataElements(): FutureData<NamedRef[]> {
        return toFuture(
            this.api.models.predictors.get({ paging: false, fields: { output: { id: true, displayName: true } } })
        ).map(({ objects }) => {
            return _.uniqBy(
                objects.map(({ output }) => ({ id: output.id, name: output.displayName })),
                "id"
            );
        });
    }

    // TODO: Response {"httpStatus":"OK","httpStatusCode":200,"status":"OK","message":"Generated 0 predictions"}
    public run(ids: string[], startDate: Date, endDate: Date): FutureData<any> {
        return Future.futureMap(ids, id =>
            toFuture(
                this.api.post(`/predictors/${id}/run`, {
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate),
                })
            )
        );
    }

    public save(inputPredictors: Predictor[]): FutureData<MetadataResponse[]> {
        const validations = inputPredictors.map(predictor => PredictorModel.decode(cleanPredictor(predictor)));
        const predictors = _.compact(validations.map(either => either.toMaybe().extract()));
        const errors = _.compact(validations.map(either => either.leftOrDefault("")));
        if (errors.length > 0) {
            return Future.error(errors.join("\n"));
        }

        const scheduling = predictors.map(item => ({ id: item.id, ...item.scheduling }));

        return this.get(predictors.map(({ id }) => id)).flatMap(existingPredictors =>
            this.getGroupsToSave(inputPredictors, existingPredictors).flatMap(predictorGroups => {
                const saveMetadata$ = toFuture(this.api.metadata.post({ predictors, predictorGroups }));
                const saveDataStore$ = this.storageRepository.saveObjectsInCollection<SaveScheduling>(
                    Namespaces.SCHEDULING,
                    scheduling
                );

                return Future.join2(saveMetadata$, saveDataStore$).map(([metadataResponse]) => [metadataResponse]);
            })
        );
    }

    public delete(ids: string[]): FutureData<any> {
        return Future.futureMap(ids, id => toFuture(this.api.models.predictors.delete({ id: id })));
    }

    private getGroupsToSave(predictors: Predictor[], existing: Predictor[]) {
        const predictorIds = predictors.map(({ id }) => id);
        const groupDictionary = _(predictors)
            .flatMap(({ id, predictorGroups }) => predictorGroups.map(group => ({ id, group })))
            .groupBy(({ group }) => group.id)
            .mapValues(items => items.map(({ id }) => id))
            .value();

        const existingGroupRefs = _.flatMap(existing, ({ predictorGroups }) => predictorGroups);
        const newGroupRefs = _.flatMap(predictors, ({ predictorGroups }) => predictorGroups);
        const allGroupRefs = _.concat(existingGroupRefs, newGroupRefs);

        const groupInfo$ = toFuture(
            this.api.metadata.get({
                predictorGroups: {
                    fields: { $owner: true },
                    filter: { id: { in: _.uniq(allGroupRefs.map(oug => oug.id)) } }, // Review 414
                },
            })
        );

        return groupInfo$.map(({ predictorGroups }) =>
            predictorGroups
                .map(group => {
                    const cleanList = group.predictors.filter(({ id }) => !predictorIds.includes(id));
                    const newItems = groupDictionary[group.id] ?? [];
                    const predictors = [...cleanList, ...newItems.map(id => ({ id }))];

                    return { ...group, predictors };
                })
                .filter(group => {
                    const newIds = group.predictors.map(({ id }) => id);
                    const oldIds =
                        predictorGroups.find(({ id }) => id === group.id)?.predictors.map(({ id }) => id) ?? [];

                    return !_.isEqual(_.sortBy(oldIds), _.sortBy(newIds));
                })
        );
    }
}

const predictorFields = {
    id: true,
    code: true,
    name: true,
    description: true,
    output: { id: true, name: true },
    outputCombo: { id: true, name: true },
    periodType: true,
    annualSampleCount: true,
    generator: {
        expression: true,
        description: true,
        missingValueStrategy: true,
        slidingWindow: true,
    },
    organisationUnitLevels: { id: true, name: true },
    predictorGroups: { id: true, name: true },
    sampleSkipTest: {
        expression: true,
        description: true,
        missingValueStrategy: true,
        slidingWindow: true,
    },
    sequentialSampleCount: true,
    sequentialSkipCount: true,
    lastUpdated: true,
    lastUpdatedBy: { id: true, name: true },
    created: true,
    user: { id: true, name: true },
    publicAccess: true,
    userAccesses: { id: true, access: true, displayName: true },
    userGroupAccesses: { id: true, access: true, displayName: true },
};

function cleanPredictor(predictor: Partial<PredictorDetails>): Partial<PredictorDetails> {
    const hasSampleSkipTest = _.has(predictor, "sampleSkipTest.expression");
    return {
        ...predictor,
        sampleSkipTest: hasSampleSkipTest ? predictor.sampleSkipTest : undefined,
    };
}
