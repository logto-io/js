/**
 * A stand-in for an external resource server.
 *
 * It only answers requests that carry an access token, which is what makes it useful for the
 * playground: the browser has to obtain a token before it can call this route directly.
 *
 * A real resource server would verify the token signature against the Logto JSON Web Key Set. The
 * check is kept minimal here so the sample does not depend on network access.
 */
export default defineEventHandler((event) => {
  const authorization = getRequestHeader(event, 'authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  return { data: 'This response came from an API called directly by the browser.' };
});
