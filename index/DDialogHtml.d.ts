/**
 * 用在 DialogHtml
 */
interface DDialogHtml {
    html: string;
    getTitle: () => string;
    registerEventWhenShowed: (dlg: JQuery<HTMLElement>) => void;
}