import type { IronSession } from 'iron-session';

export default function getPropertyDescriptorForRequestSession(
  session: IronSession
): PropertyDescriptor {
  return {
    enumerable: true,
    get() {
      return session;
    },
    set(value) {
      const keys = Object.keys(value);
      const currentKeys = Object.keys(session);

      for (const key of currentKeys) {
        if (!keys.includes(key)) {
          /* eslint-disable @typescript-eslint/no-dynamic-delete */
          /* eslint-disable @silverhand/fp/no-delete */
          // @ts-expect-error See comment in IronSessionData interface
          delete session[key];
          /* eslint-enable @silverhand/fp/no-delete */
          /* eslint-enable @typescript-eslint/no-dynamic-delete */
        }
      }

      for (const key of keys) {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        /* eslint-disable @silverhand/fp/no-mutation */
        // @ts-expect-error See comment in IronSessionData interface
        session[key] = value[key];
        /* eslint-enable @silverhand/fp/no-mutation */
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      }
    },
  };
}
