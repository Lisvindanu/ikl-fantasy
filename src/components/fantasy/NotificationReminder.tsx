import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';

interface Props {
  readonly picksLockAt: string | null;
}

const REMINDER_KEY = 'ikl-fantasy-reminder';

interface ReminderState {
  readonly lockTime: string;
  readonly scheduledAt: number;
}

function getSavedReminder(): ReminderState | null {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReminderState;
  } catch {
    return null;
  }
}

function saveReminder(lockTime: string): void {
  try {
    const state: ReminderState = { lockTime, scheduledAt: Date.now() };
    localStorage.setItem(REMINDER_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

function clearReminder(): void {
  try {
    localStorage.removeItem(REMINDER_KEY);
  } catch {
    // localStorage unavailable
  }
}

function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function NotificationReminder({ picksLockAt }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [scheduledTimers, setScheduledTimers] = useState<number[]>([]);

  // Check if reminders are already scheduled for this lock time
  useEffect(() => {
    if (!isNotificationSupported()) {
      setPermissionState('unsupported');
      return;
    }
    setPermissionState(Notification.permission);

    if (picksLockAt) {
      const saved = getSavedReminder();
      if (saved && saved.lockTime === picksLockAt) {
        setEnabled(true);
      }
    }
  }, [picksLockAt]);

  const scheduleNotifications = useCallback((lockTimeStr: string) => {
    const lockTime = new Date(lockTimeStr).getTime();
    const now = Date.now();
    const timers: number[] = [];

    const twoHoursBefore = lockTime - 2 * 60 * 60 * 1000;
    const oneHourBefore = lockTime - 60 * 60 * 1000;

    if (twoHoursBefore > now) {
      const id = window.setTimeout(() => {
        new Notification('IKL Fantasy', {
          body: 'Your lineup locks in 2 hours! Make sure your team is set.',
          icon: '/logo192.png',
          tag: 'ikl-fantasy-2h',
        });
      }, twoHoursBefore - now);
      timers.push(id);
    }

    if (oneHourBefore > now) {
      const id = window.setTimeout(() => {
        new Notification('IKL Fantasy', {
          body: 'Your lineup locks in 1 hour! Last chance to make changes.',
          icon: '/logo192.png',
          tag: 'ikl-fantasy-1h',
        });
      }, oneHourBefore - now);
      timers.push(id);
    }

    return timers;
  }, []);

  const handleToggle = useCallback(async () => {
    if (!picksLockAt) return;

    if (enabled) {
      // Disable reminders
      scheduledTimers.forEach(id => window.clearTimeout(id));
      setScheduledTimers([]);
      setEnabled(false);
      clearReminder();
      return;
    }

    // Enable reminders — request permission if needed
    if (!isNotificationSupported()) return;

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
      setPermissionState(permission);
    }

    if (permission !== 'granted') {
      setPermissionState(permission);
      return;
    }

    const timers = scheduleNotifications(picksLockAt);
    setScheduledTimers(timers);
    setEnabled(true);
    saveReminder(picksLockAt);
  }, [enabled, picksLockAt, scheduledTimers, scheduleNotifications]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      scheduledTimers.forEach(id => window.clearTimeout(id));
    };
  }, [scheduledTimers]);

  // Don't render if notifications unsupported or no lock time
  if (!picksLockAt || permissionState === 'unsupported') return null;

  const lockTime = new Date(picksLockAt);
  const now = new Date();
  const msUntilLock = lockTime.getTime() - now.getTime();

  // Don't show if lock time already passed or more than 24 hours away
  if (msUntilLock <= 0 || msUntilLock > 24 * 60 * 60 * 1000) return null;

  const hoursLeft = Math.floor(msUntilLock / (60 * 60 * 1000));
  const minutesLeft = Math.floor((msUntilLock % (60 * 60 * 1000)) / (60 * 1000));

  if (permissionState === 'denied') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <BellOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
        <span className="text-red-400">Notifications blocked by browser. Enable in site settings to get reminders.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
      style={{
        background: enabled ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
        border: `1px solid ${enabled ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.15)'}`,
      }}>
      {enabled ? (
        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
      ) : (
        <Bell className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      )}
      <span className={enabled ? 'text-green-400' : 'text-amber-400'}>
        {enabled
          ? 'Reminder set'
          : `Locks in ${hoursLeft}h ${minutesLeft}m`}
      </span>
      <button
        onClick={handleToggle}
        className="ml-auto px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
        style={{
          background: enabled ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.15)',
          color: enabled ? '#F87171' : '#F59E0B',
          border: `1px solid ${enabled ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.3)'}`,
        }}
      >
        {enabled ? 'Cancel' : 'Remind me'}
      </button>
    </div>
  );
}
