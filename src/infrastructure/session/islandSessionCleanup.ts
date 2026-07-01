const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/**
 * Cierra la sesión de forma fiable al cerrar la pestaña o salir de la página.
 * fetch() normal suele cancelarse en unload; sendBeacon/keepalive sobreviven.
 */
export function closeIslandSessionReliable(sessionId: string): void {
  const url = `${API_BASE_URL}/island/session/close`;
  const payload = JSON.stringify({ sessionId });

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const sent = navigator.sendBeacon(
      url,
      new Blob([payload], { type: 'application/json' }),
    );
    if (sent) {
      return;
    }
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
