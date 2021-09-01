import { FilterBase } from "@eyeseetea/d2-api/api/common";
import _ from "lodash";
import { Instance } from "../../domain/entities/Instance";
import { D2Api } from "../../types/d2-api";

export function getMajorVersion(version: string): number {
    const apiVersion = _.get(version.split("."), 1);
    if (!apiVersion) throw new Error(`Invalid version: ${version}`);
    return Number(apiVersion);
}

export function getD2APiFromInstance(instance: Instance) {
    return new D2Api({
        baseUrl: instance.url,
        auth:
            instance.username && instance.password
                ? { username: instance.username, password: instance.password }
                : undefined,
        backend: "fetch",
    });
}

function applyFieldTransformers(key: string, value: any) {
    // eslint-disable-next-line
    if (value.hasOwnProperty("$fn")) {
        switch (value["$fn"]["name"]) {
            case "rename":
                return {
                    key: `${key}~rename(${value["$fn"]["to"]})`,
                    value: _.omit(value, ["$fn"]),
                };
            default:
                return { key, value };
        }
    } else {
        return { key, value };
    }
}

export function getFieldsAsString(modelFields: object): string {
    return _(modelFields)
        .map((value0, key0: string) => {
            const { key, value } = applyFieldTransformers(key0, value0);

            if (typeof value === "boolean" || _.isEqual(value, {})) {
                return value ? key.replace(/^\$/, ":") : null;
            } else {
                return key + "[" + getFieldsAsString(value) + "]";
            }
        })
        .compact()
        .sortBy()
        .join(",");
}

function toArray<T>(itemOrItems: T | T[]): T[] {
    return Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
}

function isEmptyFilterValue(val: any): boolean {
    return val === undefined || val === null || val === "";
}

export function getFilterAsString(filter: FilterBase): string[] {
    return _.sortBy(
        _.flatMap(filter, (filterOrFilters, field) =>
            _.flatMap(toArray(filterOrFilters || []), filter =>
                _.compact(
                    _.map(filter, (value, op) =>
                        isEmptyFilterValue(value)
                            ? null
                            : op === "in" || op === "!in"
                            ? `${field}:${op}:[${(value as string[]).join(",")}]`
                            : `${field}:${op}:${value}`
                    )
                )
            )
        )
    );
}
