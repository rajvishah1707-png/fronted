import { useEffect, useRef } from "react";

// Refresh visible screens without overlapping requests or remounting their content.
export default function useLiveRefresh(refresh, key = "default") {
    const callback = useRef(refresh);
    useEffect(() => { callback.current = refresh; });
    useEffect(() => {
        let stopped = false;
        let running = false;
        const run = async (silent = true) => {
            if (stopped || running || (silent && document.visibilityState === "hidden")) return;
            running = true;
            try { await callback.current(silent); }
            catch (error) { /* The screen owns its error message. Keep future refreshes active. */ }
            finally { running = false; }
        };
        const resume = () => run(true);
        run(false);
        const interval = window.setInterval(resume, 10000);
        window.addEventListener("focus", resume);
        document.addEventListener("visibilitychange", resume);
        return () => {
            stopped = true;
            window.clearInterval(interval);
            window.removeEventListener("focus", resume);
            document.removeEventListener("visibilitychange", resume);
        };
    }, [key]);
}
