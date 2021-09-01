import { AppConfig } from "./webapp/components/app/App";

export const appConfig: AppConfig = {
    appKey: "predictor-extended",
    appearance: {
        showShareButton: false,
    },
    feedback: {
        token: ["03242fc6b0c5a48582", "2e6b8d3e8337b5a0b95fe2"],
        createIssue: true,
        sendToDhis2UserGroups: ["Administrators"],
        issues: {
            repository: "EyeSeeTea/predictor-extended-app",
            title: "[User feedback] {title}",
            body: "## dhis2\n\nUsername: {username}\n\n{body}",
        },
        snapshots: {
            repository: "EyeSeeTeaBotTest/snapshots",
            branch: "master",
        },
        feedbackOptions: {},
    },
};