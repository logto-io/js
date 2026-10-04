export const getCookieHeaderFromRequest = (request: Request) => request.headers.get('Cookie');
