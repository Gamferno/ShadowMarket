import { beforeAll } from 'vitest';

beforeAll(() => {
  // Ensure crypto is globally available in test environment
  if (typeof globalThis.crypto === 'undefined') {
    const nodeCrypto = require('crypto');
    globalThis.crypto = nodeCrypto.webcrypto;
  }
});
