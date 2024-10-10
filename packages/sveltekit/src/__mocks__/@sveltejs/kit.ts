import { type redirect as originalRedirect } from '@sveltejs/kit';
import { type Mock, vi } from 'vitest';

export const redirect: Mock<typeof originalRedirect> = vi.fn();
