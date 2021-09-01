import { render, RenderResult } from "@testing-library/react";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { ReactNode } from "react";
import { getCompositionRoot } from "../compositionRoot";
import { getMockApi } from "../types/d2-api";
import { AppContext, AppContextState } from "../webapp/contexts/app-context";

export function getTestConfig() {
    return {};
}

export function getTestD2() {
    return {};
}

export function getTestContext() {
    const { api, mock } = getMockApi();
    const context = {
        compositionRoot: getCompositionRoot(""),
    };

    return { mock, api, context };
}

export function getReactComponent(children: ReactNode, context: AppContextState): RenderResult {
    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
