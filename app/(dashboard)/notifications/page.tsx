'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Wrench,
  BookOpen,
  Search,
  User,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { formatDistanceToNow } from 'date-fns';

const supabase = createClient();

// Mock data for notifications
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'asset_assigned',
    title: 'Asset Assigned',
    message: 'Laptop LT-001 has been assigned to you',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/assets'
  },
  {
    id: '2',
    type: 'overdue_return',
    title: 'Overdue Return',
    message: 'Projector PR-003 is overdue for return',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/bookings'
  },
  {
    id: '3',
    type: 'maintenance_submitted',
    title: 'Maintenance Request Submitted',
    message: 'A new maintenance request has been submitted for Printer PR-001',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/maintenance'
  },
  {
    id: '4',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your booking for Meeting Room 1 has been confirmed',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: '/bookings'
  },
  {
    id: '5',
    type: 'audit_assigned',
    title: 'Audit Assigned',
    message: 'You have been assigned to the Q2 Asset Audit',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    link: '/audits'
  }
];

// Mock data for activity logs
const MOCK_ACTIVITY_LOGS = [
  {
    id: '1',
    actor: 'John Doe',
    action: 'updated',
    entity: 'Asset LT-001',
    previous_values: { status: 'available' },
    new_values: { status: 'allocated', assigned_to: 'Jane Smith' },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/assets'
  },
  {
    id: '2',
    actor: 'Jane Smith',
    action: 'created',
    entity: 'Maintenance Request MR-001',
    previous_values: null,
    new_values: { title: 'Broken screen', priority: 'high' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/maintenance'
  },
  {
    id: '3',
    actor: 'Admin User',
    action: 'approved',
    entity: 'Booking BK-005',
    previous_values: { status: 'pending' },
    new_values: { status: 'confirmed' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/bookings'
  }
];

type NotificationType = 'all' | 'alerts' | 'approvals' | 'bookings' | 'maintenance' | 'audits';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'activity'>('notifications');
  const [notificationFilter, setNotificationFilter] = useState<NotificationType>('all');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter notifications by type
  const filteredNotifications = useMemo(() => {
    if (notificationFilter === 'all') return notifications;
    return notifications.filter(n => n.type.includes(notificationFilter));
  }, [notifications, notificationFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'asset_assigned':
      case 'overdue_return':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'maintenance_submitted':
      case 'maintenance_approved':
      case 'maintenance_rejected':
      case 'technician_assigned':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_reminder':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'audit_assigned':
      case 'audit_discrepancy':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'transfer_requested':
      case 'transfer_approved':
      case 'transfer_rejected':
      case 'return_approved':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <PermissionGuard permission="notifications:view">
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-[32px] font-bold text-[#0F172A] mb-2 flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-[#64748B]">
                Stay updated with important alerts and announcements.
              </p>
            </div>
            {activeTab === 'notifications' && (
              <Button variant="ghost" onClick={markAllAsRead}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6 border-b border-[#E2E8F0] pb-1">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Activity Logs
            </button>
          </div>

          {/* Notifications Content */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'alerts', 'approvals', 'bookings', 'maintenance', 'audits'] as const).map(filter => (
                  <Button
                    key={filter}
                    variant="ghost"
                    onClick={() => setNotificationFilter(filter)}
                    className={`capitalize ${
                      notificationFilter === filter
                        ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                        : 'bg-white border border-[#E2E8F0]'
                    }`}
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              {/* Notifications List */}
              <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-[#64748B]">Loading notifications...</p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center gap-3">
                      <Bell className="w-12 h-12 text-[#E2E8F0]" />
                      <p className="text-[#64748B]">No notifications found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E2E8F0]">
                      {filteredNotifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-6 cursor-pointer hover:bg-[#F7F9FC] transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-3 rounded-full bg-white border border-[#E2E8F0]">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <h4 className="font-semibold text-[#0F172A]">
                                  {notification.title}
                                  {!notification.read && (
                                    <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </h4>
                                <span className="text-xs text-[#64748B] flex-shrink-0">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-[#64748B] mb-2">{notification.message}</p>
                              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#64748B]">
                  Showing {filteredNotifications.length} of {notifications.length} notifications
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">Previous</Button>
                  <Button variant="ghost" size="sm">Next</Button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs Content */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-[#64748B]">Loading activity logs...</p>
                    </div>
                  ) : MOCK_ACTIVITY_LOGS.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center gap-3">
                      <Clock className="w-12 h-12 text-[#E2E8F0]" />
                      <p className="text-[#64748B]">No activity logs found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E2E8F0]">
                      {MOCK_ACTIVITY_LOGS.map(log => (
                        <div key={log.id} className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center border border-[#E2E8F0]">
                                <User className="w-5 h-5 text-[#64748B]" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-[#0F172A]">
                                    {log.actor}
                                  </h4>
                                  <span className="text-sm text-[#64748B]">
                                    {log.action}
                                  </span>
                                  <span className="text-sm font-medium text-[#2563EB]">
                                    {log.entity}
                                  </span>
                                </div>
                                <span className="text-xs text-[#64748B] flex-shrink-0">
                                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                </span>
                              </div>

                              {log.previous_values && log.new_values && (
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-red-50 p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-red-800 mb-1">Previous</p>
                                    <pre className="text-xs text-red-700 whitespace-pre-wrap">
                                      {JSON.stringify(log.previous_values, null, 2)}
                                    </pre>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-800 mb-1">New</p>
                                    <pre className="text-xs text-green-700 whitespace-pre-wrap">
                                      {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs mt-2">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Record
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagination for Activity Logs */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#64748B]">
                  Showing {MOCK_ACTIVITY_LOGS.length} of {MOCK_ACTIVITY_LOGS.length} logs
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">Previous</Button>
                  <Button variant="ghost" size="sm">Next</Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PermissionGuard>
  );
}
