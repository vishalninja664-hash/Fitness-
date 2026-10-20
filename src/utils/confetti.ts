import confetti from 'canvas-confetti';

export function fireCelebration(): void {
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#55E6C1', '#10B981', '#3B82F6', '#F59E0B', '#EC4899'],
    });
  } catch (e) {
    console.debug('Confetti not available:', e);
  }
}
