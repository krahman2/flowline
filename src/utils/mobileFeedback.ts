/** Short vibration for timer events on Android / mobile browsers. */
export function vibrateOnTimerComplete(enabled: boolean) {
  if (!enabled || !('vibrate' in navigator)) return;
  navigator.vibrate([120, 60, 120]);
}
