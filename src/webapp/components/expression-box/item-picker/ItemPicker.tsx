import { Menu, Pagination } from "@dhis2/ui";
import i18n from "@eyeseetea/d2-ui-components/locales";
import styled from "styled-components";
import { GenericElementPicker } from "./GenericElementPicker";
import { ReportingRatePicker } from "./ReportingRatePicker";

export const ItemPicker: React.FC<ItemPickerProps> = ({ type, append }) => {
    switch (type) {
        case "dataElements":
            return <GenericElementPicker type="dataElements" append={id => append(`#{${id}}`)} />;
        case "programs":
            return <p>Not yet implemented</p>;
        case "orgUnitCounts":
            return <GenericElementPicker type="organisationUnitGroups" append={id => append(`OUG{${id}}`)} />;
        case "constants":
            return <GenericElementPicker type="constants" append={id => append(`C{${id}}`)} />;
        case "reportingRates":
            return <ReportingRatePicker append={id => append(`R{${id}}`)} />;
        default:
            return null;
    }
};

export const itemPickerTypes = {
    dataElements: i18n.t("Data elements"),
    //programs: i18n.t("Programs"),
    orgUnitCounts: i18n.t("Org unit counts"),
    constants: i18n.t("Constants"),
    reportingRates: i18n.t("Reporting rates"),
};

export type ItemPickerType = keyof typeof itemPickerTypes;

export interface ItemPickerProps {
    type: string;
    append: (item: string) => void;
}

export const StyledMenu = styled(Menu)`
    height: 10em;
    overflow-y: scroll;
`;

export const StyledPagination = styled(Pagination)`
    margin: 8px;
`;
