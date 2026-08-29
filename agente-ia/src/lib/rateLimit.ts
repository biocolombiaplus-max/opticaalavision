// Límite simple por IP en memoria — para rutas públicas que consumen IA en cada llamada,
// sin necesitar infraestructura adicional (Redis, etc.) para un negocio de este tamaño.
export function createIpRateLimiter(maxSolicitudes: number, ventanaMs: number) {
  const contadorPorIp = new Map<string, number[]>();
  return function permitido(ip: string): boolean {
    const ahora = Date.now();
    const previas = (contadorPorIp.get(ip) ?? []).filter((t) => ahora - t < ventanaMs);
    if (previas.length >= maxSolicitudes) {
      contadorPorIp.set(ip, previas);
      return false;
    }
    previas.push(ahora);
    contadorPorIp.set(ip, previas);
    return true;
  };
}
