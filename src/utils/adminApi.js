export const API_URL = process.env.REACT_APP_API_URL || "https://backend-1df5.onrender.com";
export function clearAdminSession() {
    ["adminToken", "admin", "adminLoggedIn"].forEach(key => localStorage.removeItem(key));
}
export async function adminFetch(url, options = {}) {
    const target = new URL(url, API_URL);
    if (target.origin !== new URL(API_URL).origin || !target.pathname.startsWith("/api/")) throw new Error("Invalid API destination");
    const token = localStorage.getItem("adminToken");
    if (!token) {
        clearAdminSession();
        window.location.assign("/admin-login");
        throw new Error("Please log in as administrator again");
    }
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(target.toString(), { ...options, headers });
    if (response.status === 401) {
        clearAdminSession();
        window.location.assign("/admin-login");
    }
    return response;
}
export async function api(path, options = {}, isAdmin = false) {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
    const url = `${API_URL}${path}`;
    if (!isAdmin) headers.set("Authorization", `Bearer ${localStorage.getItem("smartCityToken") || ""}`);
    const response = await (isAdmin ? adminFetch(url, { ...options, headers }) : fetch(url, { ...options, headers }));
    if (!isAdmin && response.status === 401) {
        localStorage.removeItem("smartCityToken");
        localStorage.removeItem("smartCityUser");
        window.location.assign("/login");
    }
    let result;
    try { result = await response.json(); } catch { throw new Error("Server returned an unreadable response. Please try again."); }
    if (!response.ok || !result.success) throw new Error(result.message || "Request failed");
    return result;
}
export const money = amount => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((amount || 0) / 100);
