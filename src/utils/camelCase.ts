import camelcaseKeys from "camelcase-keys";

export function toCamelCase(data: any) {
    return camelcaseKeys(data, { deep: true });
}