import { FormField } from "./ValidatedForm";
import React, { useCallback, useEffect, useState } from "react";
import { api } from "../utils/adminApi";
import "./ApplicationDocuments.css";
export default function DocumentSelector({ requirements = [], value, onChange, onBusyChange, disabled = false }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const load = useCallback(async () => {
        setLoading(true); onBusyChange?.(true); setError("");
        try { setDocuments((await api("/api/digital-documents/my")).documents || []); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); onBusyChange?.(false); }
    }, [onBusyChange]);
    useEffect(() => { load(); }, [load]);
    const select = (requirement, id) => onChange([...value.filter(item => item.requirement !== requirement), ...(id ? [{ requirement, document: id }] : [])]);
    const upload = async (requirement, file, input) => {
        if (!file) return;
        if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
            setError("Select a PDF, JPG or PNG file up to 5 MB."); input.value = ""; return;
        }
        setUploading(requirement); onBusyChange?.(true); setError(""); setNotice("");
        try {
            const payload = new FormData();
            payload.append("document", file); payload.append("documentType", requirement);
            payload.append("documentTitle", file.name); payload.append("description", `Supporting document: ${requirement}`);
            const result = await api("/api/digital-documents", { method: "POST", body: payload });
            setDocuments(previous => [result.document, ...previous]); select(requirement, result.document._id);
            setNotice(`${requirement} uploaded and selected. It will be reviewed by the administrator.`);
        } catch (e) { setError(e.message); }
        finally { setUploading(""); onBusyChange?.(false); input.value = ""; }
    };
    const labels = requirements.length ? requirements : ["Supporting Document"];
    return <div className="application-documents">
        <p>Select an existing document or upload a new PDF/JPG/PNG (maximum 5 MB each). After upload, the file is selected automatically. Use the submit or save button below to link it to this application. The administrator reviews linked files.</p>
        {loading && <p role="status">Loading your documents...</p>}
        {error && <p className="document-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
        {labels.map((requirement, index) => <div className="document-picker" key={requirement}>
            <label htmlFor={`document-select-${index}`}>{requirement}{requirements.length > 0 ? " *" : " (Optional)"}</label>
            <FormField as="select" rules={{ required: requirements.length > 0 }} id={`document-select-${index}`}  disabled={disabled || loading || Boolean(uploading)}
                value={value.find(item => item.requirement === requirement)?.document || ""} onChange={e => select(requirement, e.target.value)}>
                <option value="">Select a document</option>
                {documents.filter(item => item.status !== "Rejected").map(item => <option value={item._id} key={item._id}>{item.documentTitle} · {item.documentType} · {item.status}</option>)}
            </FormField>
            <label className="document-upload-label">Or upload {requirement}
                <input type="file" accept="application/pdf,image/jpeg,image/png" disabled={disabled || loading || Boolean(uploading)} onChange={e => upload(requirement, e.target.files?.[0], e.target)} />
            </label>
            {uploading === requirement && <p role="status">Uploading {requirement}...</p>}
        </div>)}
        <button type="button" className="document-action" disabled={disabled || loading || Boolean(uploading)} onClick={load}>Refresh Documents</button>
    </div>;
}
