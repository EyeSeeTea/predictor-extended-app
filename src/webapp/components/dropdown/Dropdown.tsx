import i18n from "@dhis2/d2-i18n";
import { SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import _ from "lodash";

export interface DropdownOption<T extends string | undefined = string | undefined> {
    id: T;
    name: string;
}

interface DropdownProps<T extends string | undefined = string | undefined> {
    className?: string;
    items: DropdownOption<T>[];
    value: T;
    label?: string;
    onChange?: (value: T) => void;
    hideEmpty?: boolean;
    emptyLabel?: string;
    disabled?: boolean;
}

export function Dropdown<T extends string | undefined = string | undefined>({
    className,
    items,
    value,
    onChange = _.noop,
    label,
    hideEmpty = false,
    emptyLabel,
    disabled = false,
}: DropdownProps<T>) {
    return (
        <SingleSelectField
            className={className}
            label={label}
            selected={value}
            onChange={({ selected }) => onChange(selected as T)}
            disabled={disabled}
        >
            {!hideEmpty && <SingleSelectOption label={emptyLabel ?? i18n.t("<No value>")} value="" />}
            {items.map(element => (
                <SingleSelectOption key={element.id} label={element.name} value={element.id ?? ""} />
            ))}
        </SingleSelectField>
    );
}
