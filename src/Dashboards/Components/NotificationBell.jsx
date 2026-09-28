import React, { useState, useEffect, useRef } from 'react';
import '../Styles/NotificationBell.css';
import API from '../../Core/api';

function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        API.get('/notifications')
            .then((response) => setNotifications(response.data?.notifications || []))
            .catch((error) => {
                console.error('Notifications could not be loaded:', error);
                setNotifications([]);
            });
    }, []);

    // Outside click menu close handle karna
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllAsRead = async () => {
        await API.patch('/notifications/read-all');
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    };

    const markSingleAsRead = async (id) => {
        await API.patch(`/notifications/${id}/read`);
        setNotifications((items) => items.map((item) => (item._id === id ? { ...item, read: true } : item)));
    };

    return (
        <div className="notif-wrapper" ref={dropdownRef}>
            {/* Bell Icon Trigger */}
            <button
                className="notif-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </button>

            {/* Notifications Glass Panel Dropdown */}
            {isOpen && (
                <div className="notif-dropdown">
                    {/* Header */}
                    <div className="notif-header">
                        <div>
                            <h4 className="notif-title">Notifications</h4>
                            <span className="notif-subtitle">{unreadCount} unread alerts</span>
                        </div>
                        {unreadCount > 0 && (
                            <button className="notif-action-btn" onClick={markAllAsRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Alert List Body */}
                    <div className="notif-body">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <span className="notif-empty-icon">🔔</span>
                                <p>Abhi koi naye notifications nahi hain.</p>
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item._id}
                                    className={`notif-card ${!item.read ? 'unread' : ''}`}
                                    onClick={() => markSingleAsRead(item._id)}
                                >
                                    <div className="notif-card-header">
                                        <span className={`notif-tag ${item.type === 'READY_FOR_PICKUP' ? 'tag-pickup' : 'tag-confirm'}`}>
                                            {item.type === 'READY_FOR_PICKUP' ? 'READY FOR PICKUP' : 'CONFIRMED'}
                                        </span>
                                        <span className="notif-time">{new Date(item.createdAt).toLocaleString()}</span>
                                    </div>

                                    <h5 className="notif-card-title">{item.title}</h5>
                                    <p className="notif-card-desc">{item.message}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && <div className="notif-footer">Notifications are saved to your account.</div>}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;