import React, {
    useEffect,
    useState
} from "react";

import "./Notifications.css";

const API_URL =
    "http://localhost:5000";

const Notifications = () => {

    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [unreadCount, setUnreadCount] =
        useState(0);


    // =====================================
    // FETCH NOTIFICATIONS
    // =====================================

    const fetchNotifications = async () => {

        try {

            const token =
                localStorage.getItem(
                    "smartCityToken"
                );

            if (!token) {
                return;
            }

            const response =
                await fetch(
                    `${API_URL}/api/notifications`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (response.ok) {

                setNotifications(
                    data.notifications || []
                );

                setUnreadCount(
                    data.unreadCount || 0
                );

            }

        } catch (error) {

            console.error(
                "Notification error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchNotifications();

        // Refresh every 5 seconds
        const interval =
            setInterval(
                fetchNotifications,
                5000
            );

        return () =>
            clearInterval(interval);

    }, []);


    // =====================================
    // MARK READ
    // =====================================

    const markAsRead = async (id) => {

        try {

            const token =
                localStorage.getItem(
                    "smartCityToken"
                );

            await fetch(
                `${API_URL}/api/notifications/${id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            fetchNotifications();

        } catch (error) {

            console.error(error);

        }
    };


    // =====================================
    // MARK ALL READ
    // =====================================

    const markAllRead = async () => {

        try {

            const token =
                localStorage.getItem(
                    "smartCityToken"
                );

            await fetch(
                `${API_URL}/api/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            fetchNotifications();

        } catch (error) {

            console.error(error);

        }
    };


    // =====================================
    // DATE
    // =====================================

    const formatDate = (date) => {

        return new Date(date)
            .toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
    };


    return (

        <div className="notifications-page">

            <div className="notifications-header">

                <div>

                    <h1>
                        🔔 Notifications
                    </h1>

                    <p>
                        Stay updated with your
                        Smart City activities.
                    </p>

                </div>


                {unreadCount > 0 && (

                    <button
                        onClick={markAllRead}
                        className="mark-all-btn"
                    >
                        Mark All as Read
                    </button>

                )}

            </div>


            {loading ? (

                <div className="notification-empty">
                    Loading notifications...
                </div>

            ) : notifications.length === 0 ? (

                <div className="notification-empty">

                    <div className="empty-icon">
                        🔔
                    </div>

                    <h2>
                        No Notifications
                    </h2>

                    <p>
                        You are all caught up!
                    </p>

                </div>

            ) : (

                <div className="notification-list">

                    {notifications.map(
                        (notification) => (

                            <div
                                key={
                                    notification._id
                                }
                                className={
                                    `notification-card ${
                                        notification.isRead
                                            ? "read"
                                            : "unread"
                                    }`
                                }
                                onClick={() =>
                                    markAsRead(
                                        notification._id
                                    )
                                }
                            >

                                <div className="notification-icon">

                                    {notification.type ===
                                    "Complaint"
                                        ? "📢"
                                        : notification.type ===
                                          "Application"
                                        ? "📄"
                                        : "🔔"}

                                </div>


                                <div className="notification-content">

                                    <div className="notification-title-row">

                                        <h3>
                                            {
                                                notification.title
                                            }
                                        </h3>

                                        {!notification.isRead && (
                                            <span className="new-badge">
                                                NEW
                                            </span>
                                        )}

                                    </div>


                                    <p>
                                        {
                                            notification.message
                                        }
                                    </p>


                                    <small>
                                        {formatDate(
                                            notification.createdAt
                                        )}
                                    </small>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
};

export default Notifications;