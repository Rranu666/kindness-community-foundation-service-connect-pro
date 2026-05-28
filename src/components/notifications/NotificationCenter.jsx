import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const NOTIFICATION_ICONS = {
  booking_confirmed: '📅',
  provider_assigned: '✅',
  service_started: '🚀',
  service_completed: '🎉',
  payment_received: '💳',
  payout_approved: '💰',
  promotion_alert: '🎁',
  cancellation: '❌',
  review_reminder: '⭐'
};

export default function NotificationCenter() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => {
      if (!user?.email) return [];
      return db.Notification.filter(
        { recipient_email: user.email },
        '-created_date'
      );
    },
    enabled: !!user?.email,
    refetchInterval: 30000 // Poll every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      db.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => refetch()
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => 
      db.Notification.delete(notificationId),
    onSuccess: () => refetch()
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ background: '#cb3c7a', color: '#fff' }}
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.3)' }} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Notifications</DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 rounded-lg border transition-colors cursor-pointer"
                style={{
                  background: notification.is_read ? 'rgba(255,255,255,0.03)' : 'rgba(203,60,122,0.1)',
                  borderColor: notification.is_read ? 'rgba(255,255,255,0.08)' : 'rgba(203,60,122,0.25)'
                }}
                onClick={() => !notification.is_read && markAsReadMutation.mutate(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{NOTIFICATION_ICONS[notification.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{notification.title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {notification.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(notification.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                      >
                        <Check className="w-3 h-3" style={{ color: '#cb3c7a' }} />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotificationMutation.mutate(notification.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}