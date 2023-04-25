import type { LogtoErrorCode } from './errors.js';
import { isLogtoRequestError, LogtoError, LogtoRequestError, OidcError } from './errors.js';

describe('LogtoError', () => {
  test('new LogtoError should contain correct properties', () => {
    const code: LogtoErrorCode = 'callback_uri_verification.missing_code';
    const error = 'error_value';
    const errorDescription = 'error_description_content';
    const logtoError = new LogtoError(code, { error, errorDescription });
    expect(logtoError).toHaveProperty('code', code);
    expect(logtoError).toHaveProperty('message', 'Missing code in the callback URI');
    expect(logtoError).toHaveProperty('data', { error, errorDescription });
  });

  test('new LogtoError with error code, which is not related to unique message, should contain message equaling to error code', () => {
    const code: LogtoErrorCode = 'callback_uri_verification.missing_code';
    const error = 'error_value';
    const errorDescription = 'error_description_content';
    const logtoError = new LogtoError(code, new OidcError(error, errorDescription));
    expect(logtoError).toHaveProperty('code', code);
    expect(logtoError).toHaveProperty('message', 'Missing code in the callback URI');
    expect(logtoError).toHaveProperty('data', { error, errorDescription });
    expect(logtoError.data).toBeInstanceOf(OidcError);
  });
});

const code = 'some code';
const message = 'some message';

describe('isLogtoRequestError checks the error response from the server', () => {
  it('should be false when the error response is empty', () => {
    expect(isLogtoRequestError({})).toBeFalsy();
  });

  it('should be true when the error response contains the expected properties', () => {
    expect(isLogtoRequestError({ code, message })).toBeTruthy();
  });

  it('should be true when the error response contains more than the expected properties', () => {
    expect(isLogtoRequestError({ code, message, foo: 'bar' })).toBeTruthy();
  });
});

describe('LogtoRequestError', () => {
  test('new LogtoRequestError should contain correct properties', () => {
    const logtoRequestError = new LogtoRequestError(code, message);
    expect(logtoRequestError).toHaveProperty('code', code);
    expect(logtoRequestError).toHaveProperty('message', message);
  });
});
