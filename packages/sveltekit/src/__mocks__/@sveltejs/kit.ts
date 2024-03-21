import { type redirect as originalRedirect } from '@sveltejs/kit';
import { type Mock, vi } from 'vitest';

export const redirect: Mock<
  Parameters<typeof originalRedirect>,
  ReturnType<typeof originalRedirect>
> = vi.fn();
