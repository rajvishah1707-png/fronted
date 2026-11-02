import React from "react";
import { Link } from "react-router-dom";
import "./ManagementLayout.css";
const links = [["Dashboard", "/admin-dashboard"], ["Citizens", "/admin/citizens"], ["Services", "/admin/services"], ["Applications", "/admin/applications"], ["Complaints", "/admin/complaints"], ["Payments", "/admin/payments"], ["Categories", "/admin/categories"], ["Notifications", "/admin/notifications"], ["Feedback", "/admin/feedback"], ["Statistics", "/admin/statistics"], ["Digital Documents", "/admin/digital-documents"]];
export default function ManagementLayout({ title, subtitle, isAdmin = true, children }) {
    return <div className="management-page">
        <header className="management-header"><div><span className="management-eyebrow">SMART CITY · {isAdmin ? "ADMINISTRATION" : "CITIZEN PORTAL"}</span><h1>{title}</h1><p>{subtitle}</p></div><Link className="management-button secondary" to={isAdmin ? "/admin-dashboard" : "/dashboard"}>← Dashboard</Link></header>
        <nav className="management-nav" aria-label={isAdmin ? "Admin sections" : "Citizen sections"}>{(isAdmin ? links : [["My Applications", "/my-applications"], ["Payments", "/payments"], ["Feedback", "/feedback"]]).map(([label, url]) => <Link key={url} to={url}>{label}</Link>)}</nav>
        <main>{children}</main>
    </div>;
}
