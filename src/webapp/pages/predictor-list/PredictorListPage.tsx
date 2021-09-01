import {
    DatePicker,
    MultipleDropdown,
    ObjectsList,
    Pager,
    TableConfig,
    TablePagination,
    TableSorting,
    useLoading,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { ArrowDownward, ArrowUpward, Delete, Edit, GridOn, QueuePlayNext, Schedule } from "@material-ui/icons";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileRejection } from "react-dropzone";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { NamedRef } from "../../../domain/entities/DHIS2";
import { FormulaVariable } from "../../../domain/entities/FormulaVariable";
import { MetadataResponse } from "../../../domain/entities/Metadata";
import { PredictorDetails } from "../../../domain/entities/Predictor";
import { ListPredictorsFilters } from "../../../domain/repositories/PredictorRepository";
import i18n from "../../../locales";
import { formatDate } from "../../../utils/dates";
import { AlertIcon } from "../../components/alert-icon/AlertIcon";
import { Dropzone, DropzoneRef } from "../../components/dropzone/Dropzone";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { periodTypes } from "../../components/predictor-form/PredictorForm";
import { useAppContext } from "../../contexts/app-context";
import { useFuture } from "../../hooks/useFuture";
import { useQueryState } from "../../hooks/useQueryState";
import { useReload } from "../../hooks/useReload";

export const PredictorListPage: React.FC = () => {
    const { compositionRoot, currentUser } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const history = useHistory();

    const fileRef = useRef<DropzoneRef>(null);

    const [state, setState] = useQueryState<ListPredictorsFilters>({});
    const [response, setResponse] = useState<MetadataResponse[]>();
    const [variables, setVariables] = useState<FormulaVariable[]>([]);
    const [reloadKey, reload] = useReload();

    const { data: predictorGroupOptions = [] } = useFuture(() => {
        return compositionRoot.predictors
            .getGroups()
            .map(groups => groups.map(({ id, name }) => ({ value: id, text: name })));
    }, []);

    const { data: dataElementsOptions = [] } = useFuture(() => {
        return compositionRoot.predictors
            .getDataElements()
            .map(dataElements => dataElements.map(({ id, name }) => ({ value: id, text: name })));
    }, []);

    useEffect(() => {
        compositionRoot.expressions.getSuggestions().run(
            variables => setVariables(variables),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    const goToSettings = useCallback(() => {
        history.push("/settings");
    }, [history]);

    const runPredictors = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Running predictors"));
            const results = await compositionRoot.predictors.run(ids).toPromise();
            snackbar.info(results.map((response: any) => response?.message).join("\n"));
            loading.reset();
        },
        [compositionRoot, loading, snackbar]
    );

    const exportPredictors = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Exporting predictors"));
            await compositionRoot.predictors.export(ids);
            loading.reset();
        },
        [compositionRoot, loading]
    );

    const newPredictor = useCallback(() => history.push(`/new`), [history]);

    const editPredictor = useCallback(
        (ids: string[]) => {
            if (ids.length === 1) {
                history.push(`/edit/${ids[0]}`);
            } else {
                compositionRoot.predictors.get(ids).run(
                    predictors => {
                        history.push({ pathname: `/bulk-edit`, state: { predictors } });
                    },
                    error => snackbar.error(error)
                );
            }
        },
        [history, compositionRoot, snackbar]
    );

    const deletePredictor = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Deleting predictors"));
            await compositionRoot.predictors.delete(ids);
            loading.reset();
            reload();
        },
        [compositionRoot, loading, reload]
    );

    const openImportDialog = useCallback(async () => {
        fileRef.current?.openDialog();
    }, [fileRef]);

    const baseConfig = useMemo((): TableConfig<PredictorDetails> => {
        return {
            columns: [
                {
                    name: "id",
                    text: i18n.t("Identifier"),
                    sortable: true,
                    hidden: true,
                },
                { name: "name", text: i18n.t("Name"), sortable: true },
                {
                    name: "scheduling",
                    text: i18n.t("Scheduling"),
                    sortable: true,
                    getValue: ({ scheduling }: PredictorDetails) => {
                        return `Sequence: ${scheduling.sequence}\nVariable: ${scheduling.variable}`;
                    },
                },
                { name: "output", text: i18n.t("Output data element"), sortable: true },
                {
                    name: "outputCombo",
                    text: i18n.t("Output category option"),
                    sortable: true,
                    getValue: ({ output, outputCombo }) => (
                        <OutputComboCell output={output} outputCombo={outputCombo} variables={variables} />
                    ),
                },
                { name: "description", text: i18n.t("Description"), sortable: false },
                {
                    name: "generator",
                    text: i18n.t("Formula"),
                    sortable: false,
                    getValue: ({ generator }: PredictorDetails) => <FormulaCell formula={generator.expression} />,
                },
                { name: "predictorGroups", text: i18n.t("Predictor groups"), sortable: true },
                {
                    name: "organisationUnitLevels",
                    text: i18n.t("Organisation unit levels"),
                    sortable: true,
                    hidden: true,
                },
                {
                    name: "periodType",
                    text: i18n.t("Period type"),
                    sortable: true,
                    getValue: ({ periodType }: PredictorDetails) => {
                        return periodTypes.find(({ value }) => value === periodType)?.label ?? "-";
                    },
                },
                {
                    name: "sampleSkipTest",
                    text: i18n.t("Sample skip test"),
                    sortable: false,
                    getValue: ({ sampleSkipTest }: PredictorDetails) => {
                        return sampleSkipTest?.expression ?? "-";
                    },
                },
                { name: "lastUpdated", text: i18n.t("Last Updated"), sortable: true },
            ],
            details: [
                { name: "id", text: i18n.t("Identifier") },
                { name: "code", text: i18n.t("Code") },
                { name: "name", text: i18n.t("Name") },
                { name: "description", text: i18n.t("Description") },
                { name: "output", text: i18n.t("Output data element") },
                { name: "outputCombo", text: i18n.t("Output data element") },
                { name: "lastUpdated", text: i18n.t("Last updated") },
                { name: "lastUpdatedBy", text: i18n.t("Last updated by") },
                { name: "created", text: i18n.t("Created") },
                { name: "user", text: i18n.t("Created by") },
            ],
            actions: [
                {
                    name: "details",
                    text: i18n.t("Details"),
                    multiple: false,
                    primary: true,
                },
                {
                    name: "edit",
                    text: i18n.t("Edit"),
                    multiple: true,
                    onClick: editPredictor,
                    icon: <Edit />,
                },
                {
                    name: "delete",
                    text: i18n.t("Delete"),
                    multiple: true,
                    onClick: deletePredictor,
                    icon: <Delete />,
                },
                {
                    name: "execute",
                    text: i18n.t("Run"),
                    multiple: false,
                    onClick: runPredictors,
                    icon: <QueuePlayNext />,
                },
                {
                    name: "export",
                    text: i18n.t("Export"),
                    multiple: true,
                    onClick: exportPredictors,
                    icon: <ArrowDownward />,
                },
            ],
            globalActions: _.compact([
                {
                    name: "import",
                    text: i18n.t("Import excel"),
                    onClick: openImportDialog,
                    icon: <ArrowUpward />,
                },
                {
                    name: "export",
                    text: i18n.t("Download empty excel template"),
                    onClick: () => exportPredictors([]),
                    icon: <GridOn />,
                },
                process.env.NODE_ENV === "development" && currentUser.isAdmin
                    ? {
                          name: "scheduling",
                          text: i18n.t("Scheduling options"),
                          onClick: goToSettings,
                          icon: <Schedule />,
                      }
                    : undefined,
            ]),
            // TODO: Bug in ObjectsList
            initialSorting: {
                field: "name",
                order: "asc",
            },
            initialState: {
                sorting: {
                    field: "name",
                    order: "asc",
                },
            },
            paginationOptions: {
                pageSizeOptions: [10, 25, 50, 100],
                pageSizeInitialValue: 25,
            },
            searchBoxLabel: i18n.t("Search by name"),
            onActionButtonClick: newPredictor,
        };
    }, [
        runPredictors,
        exportPredictors,
        newPredictor,
        editPredictor,
        deletePredictor,
        openImportDialog,
        currentUser,
        goToSettings,
        variables,
    ]);

    const refreshRows = useCallback(
        (
            search: string,
            paging: TablePagination,
            sorting: TableSorting<PredictorDetails>
        ): Promise<{ objects: PredictorDetails[]; pager: Pager }> => {
            console.debug("Reloading", reloadKey);
            return compositionRoot.predictors.list({ ...state, search }, paging, sorting).toPromise();
        },
        [compositionRoot, state, reloadKey]
    );

    const tableProps = useObjectsTable(baseConfig, refreshRows);

    const handleFileUpload = useCallback(
        async (files: File[], rejections: FileRejection[]) => {
            if (files.length === 0 && rejections.length > 0) {
                snackbar.error(i18n.t("Couldn't read the file because it's not valid"));
                return;
            }

            loading.show(true, i18n.t("Reading files"));

            const { predictors } = await compositionRoot.predictors.readExcel(files);
            history.push({ pathname: `/import`, state: { predictors } });
            loading.reset();
        },
        [compositionRoot, loading, snackbar, history]
    );

    const onChangeFilter = useCallback(
        (update: Partial<ListPredictorsFilters>) => {
            if (tableProps.onChangeSearch) {
                tableProps.onChangeSearch(update.search ?? "");
            }

            setState(state => ({ ...state, ...update }));
        },
        [setState, tableProps]
    );

    const onChangeGroupFilter = useCallback(
        (predictorGroups: string[]) => onChangeFilter({ predictorGroups }),
        [onChangeFilter]
    );

    const onChangeOutputFilter = useCallback(
        (dataElements: string[]) => onChangeFilter({ dataElements }),
        [onChangeFilter]
    );

    const onChangeLastUpdatedFilter = useCallback(
        (lastUpdated: { toDate(): Date } | null) =>
            onChangeFilter({
                lastUpdated: lastUpdated ? formatDate(lastUpdated.toDate()) : undefined,
            }),
        [onChangeFilter]
    );

    return (
        <Wrapper>
            <Dropzone
                ref={fileRef}
                accept={"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
                onDrop={handleFileUpload}
            >
                <ObjectsList<PredictorDetails>
                    {...tableProps}
                    onChangeSearch={search => onChangeFilter({ search })}
                    initialSearch={state.search ?? ""}
                >
                    <React.Fragment>
                        {state.predictorGroups && state.predictorGroups.length > 0 && (
                            <Filter
                                items={predictorGroupOptions}
                                values={state.predictorGroups ?? []}
                                onChange={onChangeGroupFilter}
                                label={i18n.t("Predictor groups")}
                            />
                        )}

                        <Filter
                            items={dataElementsOptions}
                            values={state.dataElements ?? []}
                            onChange={onChangeOutputFilter}
                            label={i18n.t("Output data element")}
                        />

                        <DatePicker
                            placeholder={i18n.t("Last updated date")}
                            value={state.lastUpdated ?? null}
                            isFilter={true}
                            onChange={onChangeLastUpdatedFilter}
                        />
                    </React.Fragment>
                </ObjectsList>
            </Dropzone>

            {response && <ImportSummary results={response} onClose={() => setResponse(undefined)} />}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    padding: 20px;
    height: 100%;
`;

const Filter = styled(MultipleDropdown)`
    min-width: 200px;
`;

const FormulaCell: React.FC<{ formula: string }> = ({ formula }) => {
    const { compositionRoot } = useAppContext();
    const { data: validation } = useFuture(compositionRoot.expressions.validate, ["predictor-formula", formula]);

    switch (validation?.status) {
        case "OK":
            return <React.Fragment>{validation.description}</React.Fragment>;
        case "ERROR":
            return (
                <React.Fragment>
                    {formula}
                    <AlertIcon tooltip={validation.message} />
                </React.Fragment>
            );
        default:
            return <React.Fragment>{formula}</React.Fragment>;
    }
};

const OutputComboCell: React.FC<{ output: NamedRef; outputCombo?: NamedRef; variables: FormulaVariable[] }> = ({
    output,
    outputCombo,
    variables,
}) => {
    const validCombos = variables?.find(({ id }) => id === output.id)?.options;

    return (
        <React.Fragment>
            {outputCombo?.name ?? "-"}
            {validCombos && !validCombos.find(({ id }) => id === outputCombo?.id) ? (
                <AlertIcon tooltip={i18n.t("Invalid output combo")} />
            ) : null}
        </React.Fragment>
    );
};
