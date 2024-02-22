import { vitest } from 'vitest';

vitest.stubGlobal('defineEventHandler', (handler: unknown) => handler);
