import { editor, languages } from "monaco-editor";

export type Suggestion = Omit<languages.CompletionItem, "range">;
export type ValidationMarker = Omit<editor.IMarkerData, "relatedInformation">;
