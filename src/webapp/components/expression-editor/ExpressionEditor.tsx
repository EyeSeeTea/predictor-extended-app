import Editor, { Monaco } from "@monaco-editor/react";
import _ from "lodash";
import { editor } from "monaco-editor";
import React, { useCallback } from "react";
import { FormulaVariable } from "../../../domain/entities/FormulaVariable";
import i18n from "../../../locales";
import { interpolate } from "../../../utils/uid-replacement";
import { buildPredictorsCompletionProvider } from "./completion/predictors";
import { PredictorsLanguageConfiguration } from "./language/predictors";
import { ValidationMarker } from "./types";

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
    className,
    variables,
    onValidate,
    onChange,
    value,
    includeNameAndCodeSuggestions,
}) => {
    const handleEditorDidMount = useCallback(
        (monaco: Monaco) => {
            monaco.languages.register({ id: "dhis" });
            monaco.languages.setLanguageConfiguration("dhis", PredictorsLanguageConfiguration);
            monaco.languages.registerCompletionItemProvider(
                "dhis",
                buildPredictorsCompletionProvider({ variables, onValidate, includeNameAndCodeSuggestions })
            );
            monaco.languages.registerHoverProvider("dhis", {
                provideHover: function (model, position) {
                    const reference = model.getWordAtPosition(position);
                    const variable = variables?.find(variable => variable.id === reference?.word);

                    if (variable) {
                        const descriptions = variable.properties
                            ?.map(({ label, value }) => `**${label}:** ${value}`)
                            .join("\n\n");

                        return {
                            range: new monaco.Range(
                                model.getLineCount(),
                                reference?.startColumn ?? 0,
                                model.getLineCount(),
                                reference?.endColumn ?? 0
                            ),
                            contents: _.compact([
                                {
                                    value: _.compact([`**${_.trim(variable.label)}**`, variable.description]).join(
                                        "\n\n"
                                    ),
                                },
                                { value: `*${formatType(variable.type)}*` },
                                descriptions ? { value: descriptions } : undefined,
                            ]),
                        };
                    }
                },
            });
        },
        [includeNameAndCodeSuggestions, onValidate, variables]
    );

    const handleEditorOnMount = useCallback(
        (editor: editor.IStandaloneCodeEditor) => {
            editor.addAction({
                id: "format-expression",
                label: i18n.t("Format DHIS2 Expression"),
                contextMenuGroupId: "1_modification",
                run: (editor: editor.IStandaloneCodeEditor) => {
                    const text = editor.getValue();
                    const dictionary = _.fromPairs(
                        variables?.map(({ filterText, insertText }) => [filterText, insertText])
                    );
                    editor.setValue(interpolate(text, dictionary));
                },
            });
        },
        [variables]
    );

    return (
        <Editor
            className={className}
            height="22vh"
            defaultLanguage="dhis"
            onChange={onChange}
            value={value}
            beforeMount={handleEditorDidMount}
            onMount={handleEditorOnMount}
            options={{
                minimap: { enabled: false },
                lineNumbers: "off",
                renderLineHighlight: "none",
                scrollbar: { useShadows: false, vertical: "hidden" },
                suggest: { snippetsPreventQuickSuggestions: false },
            }}
        />
    );
};

export interface ExpressionEditorProps {
    className?: string;
    type: "predictor-generator" | "predictor-sample-skip";
    variables?: FormulaVariable[];
    includeNameAndCodeSuggestions?: boolean;
    onValidate?: (expression: string) => Promise<ValidationMarker[] | undefined>;
    onChange?: (expression?: string) => void;
    value: string;
}

function formatType(type: string): string {
    switch (type) {
        case "dataElements":
            return i18n.t("Data Element");
        case "organisationUnitGroups":
            return i18n.t("Organisation unit group");
        case "constants":
            return i18n.t("Constant");
        case "categoryOptionCombos":
            return i18n.t("Category option combo");
        default:
            return type;
    }
}
