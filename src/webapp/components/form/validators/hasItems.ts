import i18n from "../../../../locales";

export const hasItems = (value: unknown): string | undefined => {
    if (!Array.isArray(value)) return i18n.t("Value must be an array");
    if (value.length === 0) return i18n.t("You need to at least select one option");
    return undefined;
};
