/**
 * Local Notification and Audio Service for TinySteps
 * Supports browser Web Notification API + Web Audio chime + in-app fallback
 */

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationStatus;
}

export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm as NotificationStatus;
  } catch (err) {
    console.error('Failed to request notification permission', err);
    return 'denied';
  }
}

/**
 * Plays a pleasant, calming chime using the Web Audio API.
 * No external audio files needed; 100% reliable offline.
 */
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Gentle 3-note harmonic chime (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.9);
    });
  } catch (e) {
    console.warn('Audio playback could not be started:', e);
  }
}

/**
 * Trigger local notification to user's device
 */
export function sendHabitNotification(
  habitName: string,
  tinyStep: string,
  onActionClick?: () => void
): boolean {
  // Always play gentle audio chime
  playChimeSound();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(`🌱 TinySteps Reminder: ${tinyStep}`, {
        body: `Big Goal: ${habitName}\nTake 2 minutes right now for your small win!`,
        icon: 'https://api.iconify.design/lucide:sprout.svg?color=%2310b981',
        tag: `tiny-step-${Date.now()}`,
      });

      notif.onclick = () => {
        window.focus();
        if (onActionClick) onActionClick();
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('Native notification failed, in-app notification active', e);
      return false;
    }
  }

  return false;
}
