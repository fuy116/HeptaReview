(async () => {
  const { webcrypto } = await import('node:crypto');
  // 強制覆蓋 globalThis.crypto，確保它有 getRandomValues
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: true, configurable: true });
})(); 