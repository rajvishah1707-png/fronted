import ValidatedForm from "./ValidatedForm";
import React, { useCallback, useEffect, useState } from "react";
import { api } from "../utils/adminApi";
import { openDocumentFile } from "../utils/documentFiles";
import DocumentSelector from "./DocumentSelector";
import "./ApplicationDocuments.css";
export default function ApplicationDocuments({ applicationId, isAdmin = false }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selection, setSelection] = useState([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const result = await api(`/api/service-applications/${applicationId}/documents`, {}, isAdmin);
            setData(result); setSelection(result.documents.filter(item => item.document).map(item => ({ requirement: item.requirement, document: item.document._id })));
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [applicationId, isAdmin]);
    useEffect(() => { setEditing(false); setNotice(""); load(); }, [load]);
    const run = async operation => {
        setBusy(true); setError(""); setNotice("");
        try { await operation(); await load(); setNotice("Document changes saved."); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    };
    const viewFile = async (document, download = false) => {
        setBusy(true); setError("");
        try { await openDocumentFile(document, isAdmin, download); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    };
    const review = (document, decision) => {
        const adminRemark = window.prompt(decision === "reject" ? "Give a rejection reason so the citizen can replace this document:" : "Verification remark (optional):", document.adminRemark || "");
        if (adminRemark == null) return;
        if (decision === "reject" && !adminRemark.trim()) { setError("A rejection reason is required."); return; }
        run(() => api(`/api/digital-documents/admin/${document._id}/${decision}`, { method: "PATCH", body: JSON.stringify({ adminRemark }) }, true));
    };
    const save = event => { event.preventDefault(); run(async () => { await api(`/api/service-applications/${applicationId}/documents`, { method: "PATCH", body: JSON.stringify({ documents: selection }) }); setEditing(false); }); };
    return <section className="application-documents" aria-label="Application documents">
        <h2>Application Documents</h2>
        {loading && <p role="status">Loading linked documents...</p>}{error && <p className="document-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
        {data && !loading && <>
            <p><strong>Application status:</strong> {data.applicationStatus || "Unavailable"}</p>
            {data.legacy && <p className="document-note">This older application has no original document requirement snapshot. Existing documents are not linked automatically.</p>}
            {data.requirements.length > 0 && <p><strong>Required:</strong> {data.requirements.join(", ")}</p>}
            {!data.documents.length && <p>No documents are linked to this application.</p>}
            {data.documents.map((item, index) => <article className="linked-document" key={`${item.requirement}-${index}`}>
                <strong>{item.requirement}</strong>
                {item.document ? <><p>{item.document.documentTitle} · <span>Document verification: {item.document.status}</span></p><p>{item.document.documentId}</p>
                    {item.document.adminRemark && <p><strong>Admin remark:</strong> {item.document.adminRemark}</p>}
                    <div className="application-file-actions"><button type="button" className="application-file-action" disabled={busy} onClick={() => viewFile(item.document)}>View File</button>
                        <button type="button" className="application-file-action" disabled={busy} onClick={() => viewFile(item.document, true)}>Download</button>
                        {isAdmin && <><button type="button" className="application-file-action" disabled={busy || item.document.status === "Verified"} onClick={() => review(item.document, "verify")}>Verify Document</button><button type="button" className="application-file-action" disabled={busy || item.document.status === "Rejected"} onClick={() => review(item.document, "reject")}>Reject Document</button></>}
                    </div></> : <p className="document-error">The linked document is missing. The citizen must replace it before approval.</p>}
            </article>)}
            {data.canEdit && !isAdmin && data.applicationStatus === "Rejected" && <p className="document-note">After saving replacement documents, the application stays Rejected until an administrator reviews it again.</p>}
            {data.canEdit && !editing && <button type="button" className="application-file-action" disabled={busy} onClick={() => setEditing(true)}>Add / Replace Documents</button>}
            {editing && <ValidatedForm onSubmit={save}><DocumentSelector requirements={data.requirements} value={selection} onChange={setSelection} onBusyChange={setBusy} disabled={busy}/><div className="application-file-actions"><button className="application-file-action" type="submit" disabled={busy}>Save Linked Documents</button><button className="application-file-action" type="button" disabled={busy} onClick={() => setEditing(false)}>Cancel</button></div></ValidatedForm>}
            <button type="button" className="application-file-action" disabled={busy || loading} onClick={load}>Refresh Review Status</button>
            {isAdmin && <p className="document-note">Verify all linked files before changing the application to In Progress, Approved or Completed. Use Under Review while checking files. After verification, close this panel, select In Progress and click Update Application to save the application status separately. Rejecting a file does not reject the entire application.</p>}
        </>}
    </section>;
}
