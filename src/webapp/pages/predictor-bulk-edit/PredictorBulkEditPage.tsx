import { Button, ButtonStrip, CenteredContent, NoticeBox } from "@dhis2/ui";
import { useLoading } from "@eyeseetea/d2-ui-components";
import { Paper } from "@material-ui/core";
import { Delete, ViewColumn } from "@material-ui/icons";
import _ from "lodash";
import { IconButton } from "material-ui";
import React, { useCallback, useState } from "react";
import { Form, useForm } from "react-final-form";
import { Redirect, useLocation } from "react-router";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeGrid as Grid } from "react-window";
import styled from "styled-components";
import { MetadataResponse } from "../../../domain/entities/Metadata";
import { Predictor } from "../../../domain/entities/Predictor";
import i18n from "../../../locales";
import { ColumnSelectorDialog } from "../../components/column-selector-dialog/ColumnSelectorDialog";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { PageHeader } from "../../components/page-header/PageHeader";
import { RenderPredictorImportField } from "../../components/predictor-form/PredictorForm";
import { predictorFormFields, getPredictorFieldName } from "../../components/predictor-form/utils";
import { useAppContext } from "../../contexts/app-context";
import { useGoBack } from "../../hooks/useGoBack";

const rowHeight = (index: number) => (index === 0 ? 30 : 70);
const columnWidth = (index: number) => (index === 0 ? 50 : 250);

export interface PredictorBulkEditPageProps {
    type: "import" | "bulk-edit";
}

export const PredictorBulkEditPage: React.FC<PredictorBulkEditPageProps> = ({ type }) => {
    const { compositionRoot } = useAppContext();
    const goBack = useGoBack();
    const loading = useLoading();

    const location = useLocation<{ predictors: Predictor[] }>();
    const [predictors] = React.useState<Predictor[]>(location.state?.predictors ?? []);
    const [summary, setSummary] = useState<MetadataResponse[]>();
    const [columns, setColumns] = useState<string[]>(basePredictorColumns);
    const [columnSelectorOpen, setColumnSelectorOpen] = useState<boolean>(false);

    const goHome = useCallback(() => goBack(true), [goBack]);

    const onSubmit = useCallback(
        async ({ predictors }: { predictors: Predictor[] }) => {
            loading.show(true, i18n.t("Saving predictors"));
            const { data = [], error } = await compositionRoot.predictors.save(predictors).runAsync();
            if (error) return error ?? i18n.t("Network error");
            loading.reset();

            if (_.some(data, foo => foo.status === "ERROR")) {
                setSummary(data);
            } else {
                goHome();
            }
        },
        [compositionRoot, goHome, loading]
    );

    if (predictors.length === 0) return <Redirect to="/" />;

    const title = type === "import" ? i18n.t("Import predictors") : i18n.t("Edit predictors");
    const closeSummary = () => setSummary(undefined);

    return (
        <Wrapper>
            <PageHeader onBackClick={goBack} title={title}>
                <IconButton
                    tooltip={i18n.t("Column settings")}
                    onClick={() => setColumnSelectorOpen(true)}
                    style={{ float: "right" }}
                >
                    <ViewColumn />
                </IconButton>
            </PageHeader>

            {summary ? <ImportSummary results={summary} onClose={closeSummary} /> : null}

            {columnSelectorOpen && (
                <ColumnSelectorDialog
                    columns={predictorFormFields}
                    visibleColumns={columns}
                    onChange={setColumns}
                    getName={getPredictorFieldName}
                    onCancel={() => setColumnSelectorOpen(false)}
                />
            )}

            <Container>
                <Form<{ predictors: Predictor[] }>
                    autocomplete="off"
                    onSubmit={onSubmit}
                    initialValues={{ predictors }}
                    render={({ handleSubmit, values, submitError }) => (
                        <StyledForm onSubmit={handleSubmit}>
                            <MaxHeight>
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <Grid
                                            height={height}
                                            width={width}
                                            rowCount={values.predictors.length + 1}
                                            columnCount={columns.length + 1}
                                            estimatedColumnWidth={250}
                                            estimatedRowHeight={70}
                                            rowHeight={rowHeight}
                                            columnWidth={columnWidth}
                                            itemData={{ columns }}
                                        >
                                            {Row}
                                        </Grid>
                                    )}
                                </AutoSizer>
                            </MaxHeight>

                            {submitError && (
                                <NoticeBox title={i18n.t("Error saving predictors")} error={true}>
                                    {submitError}
                                </NoticeBox>
                            )}

                            <ButtonsRow middle>
                                <Button type="submit" primary>
                                    {i18n.t("Save")}
                                </Button>

                                <Button type="reset" onClick={goHome}>
                                    {i18n.t("Close")}
                                </Button>
                            </ButtonsRow>
                        </StyledForm>
                    )}
                />
            </Container>
        </Wrapper>
    );
};

const basePredictorColumns = [
    "id",
    "name",
    "scheduling.sequence",
    "scheduling.variable",
    "output",
    "generator.expression",
];

const MaxHeight = styled.div`
    height: 95%;
`;

const ButtonsRow = styled(ButtonStrip)`
    padding: 20px;

    button:focus::after {
        border-color: transparent !important;
    }
`;

const Row: React.FC<RowItemProps & { style: object }> = ({ style, ...props }) => (
    <div style={style}>
        <RowItem {...props} />
    </div>
);

interface RowItemProps {
    data: { columns: string[] };
    columnIndex: number;
    rowIndex: number;
}

const RowItem: React.FC<RowItemProps> = ({ data, columnIndex, rowIndex }) => {
    const form = useForm<{ predictors: Predictor[] }>();

    const headerRow = rowIndex === 0;
    const deleteRow = columnIndex === 0;
    const row = rowIndex - 1;
    const field = data.columns[columnIndex - 1];

    const removeRow = useCallback(() => {
        const original = form.getState().values.predictors;
        const predictors = [...original.slice(0, row), ...original.slice(row + 1)];
        form.change("predictors", predictors);
    }, [form, row]);

    if (deleteRow) {
        return headerRow ? null : (
            <CenteredContent>
                <IconButton tooltip={i18n.t("Delete")} tooltipPosition="top-center" onClick={removeRow}>
                    <Delete />
                </IconButton>
            </CenteredContent>
        );
    }

    if (!field) return null;

    if (headerRow) {
        return (
            <CenteredContent>
                <Title>{getPredictorFieldName(field)}</Title>
            </CenteredContent>
        );
    }

    return (
        <Item>
            <RenderPredictorImportField row={row} field={field} />
        </Item>
    );
};

const Wrapper = styled.div`
    margin: 20px;
`;

const StyledForm = styled.form`
    height: 71vh;
`;

const Container = styled(Paper)`
    margin: 20px;
    padding: 40px;
`;

const Item = styled.div`
    margin: 4px 0;
    padding: 10px;
`;

const Title = styled.b``;
