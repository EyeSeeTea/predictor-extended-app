import { CancellationToken, editor, IRange, languages, Position } from "monaco-editor";
import { FormulaVariable } from "../../../../domain/entities/FormulaVariable";
import { PredictorSuggestions } from "../suggestions/predictors";
import { ValidationMarker } from "../types";

export interface CompletionProviderOptions {
    variables?: FormulaVariable[];
    includeNameAndCodeSuggestions?: boolean;
    onValidate?: (expression: string) => Promise<ValidationMarker[] | undefined>;
}

export const buildPredictorsCompletionProvider = ({
    variables = [],
}: CompletionProviderOptions): languages.CompletionItemProvider => ({
    triggerCharacters: [".", "{"],
    provideCompletionItems: async (
        model: editor.ITextModel,
        position: Position,
        _context: languages.CompletionContext,
        _token: CancellationToken
    ): Promise<languages.CompletionList | null | undefined> => {
        const value = model.getValue();
        const token = value[position.column - 2];
        const item = model.getWordUntilPosition(position);
        const prevWord = model.getWordAtPosition({ ...position, column: item.startColumn - 1 });

        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: item.startColumn,
            endColumn: item.endColumn,
        };

        // Detect auto-complete of opening braces
        if (token === "{") {
            const variableToken = value.substr(0, item.startColumn - 1).match(/#{$/) ? "#" : prevWord?.word;

            return {
                suggestions: variables
                    .filter(({ type }) => type === getVariableType(variableToken))
                    .map(variable => formatVariable(range, variable)),
            };
        }

        // Detect auto-complete of nested properties
        if (token === ".") {
            const prevWordVariable = variables.find(v => v.id === prevWord?.word);

            return {
                suggestions: prevWordVariable?.options?.map(variable => formatVariable(range, variable)) ?? [],
            };
        }

        return {
            suggestions: PredictorSuggestions.map(item => ({ ...item, range })),
        };
    },
});

function formatVariable(range: IRange, { filterText, insertText, label }: FormulaVariable): languages.CompletionItem {
    return {
        label,
        filterText,
        kind: languages.CompletionItemKind.Constant,
        insertText,
        range,
    };
}

function getVariableType(token?: string): string | undefined {
    switch (token) {
        case "C":
            return "constants";
        case "OUG":
            return "organisationUnitGroups";
        case "#":
            return "dataElements";
    }
}
