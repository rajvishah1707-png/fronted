import { API_URL, adminFetch } from "./adminApi";
export async function openDocumentFile(document, isAdmin = false, download = false) {
    if (!document?.filePath) throw new Error("Document file is unavailable");
    const target = new URL(document.filePath, API_URL);
    if (target.origin !== new URL(API_URL).origin || !target.pathname.startsWith("/api/digital-documents/file/")) throw new Error("Invalid document file address");
    // Open the tab while handling the user's click so popup blocking does not hide the file.
    const tab = download ? null : window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try {
        const response = await (isAdmin ? adminFetch(target.toString()) : fetch(target.toString(), {
            headers: { Authorization: `Bearer ${localStorage.getItem("smartCityToken") || ""}` }
        }));
        if (!response.ok) {
            let result; try { result = await response.json(); } catch { result = {}; }
            throw new Error(result.message || "Unable to open document");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        if (tab) tab.location.replace(url);
        else {
            const link = window.document.createElement("a");
            link.href = url; link.download = document.originalFileName || "document";
            window.document.body.appendChild(link); link.click(); link.remove();
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) { tab?.close(); throw error; }
}
