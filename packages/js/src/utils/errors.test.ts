import { LogtoError, LogtoErrorCode, LogtoRequestError } from './errors';

describe('LogtoError', () => {
  test('new LogtoError should contain correct properties', () => {
    const code: LogtoErrorCode = 'callback_uri_verification.missing_code';
    const error = 'error_value';
    const errorDescription = 'error_description_content';
    const logtoError = new LogtoError(code, { error, errorDescription });
    expect(logtoError).toHaveProperty('code', code);
    expect(logtoError).toHaveProperty('message', 'Missing code');
    expect(logtoError).toHaveProperty('data', { error, errorDescription });
  });

  test('new LogtoError with error code, which is not related to unique message, should contain message equaling to error code', () => {
    const code: LogtoErrorCode = 'callback_uri_verification';
    const error = 'error_value';
    const errorDescription = 'error_description_content';
    const logtoError = new LogtoError(code, { error, errorDescription });
    expect(logtoError).toHaveProperty('code', code);
    expect(logtoError).toHaveProperty('message', code);
    expect(logtoError).toHaveProperty('data', { error, errorDescription });
  });
});

describe('LogtoRequestError', () => {
  test('new LogtoRequestError should contain correct properties', () => {
    const code = 'some code';
    const message = 'some message';
    const logtoRequestError = new LogtoRequestError(code, message);
    expect(logtoRequestError).toHaveProperty('code', code);
    expect(logtoRequestError).toHaveProperty('message', message);
  });
});
