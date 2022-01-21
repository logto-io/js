import { LogtoError, LogtoErrorCode } from './errors';

describe('LogtoError', () => {
  test('new LogtoError should contain correct properties', () => {
    const errorCode: LogtoErrorCode = 'callback_uri_verification.missing_code';
    const error = 'error_value';
    const errorDescription = 'error_description_content';
    const logtoError = new LogtoError(errorCode, error, errorDescription);
    expect(logtoError).toHaveProperty('code', errorCode);
    expect(logtoError).toHaveProperty('message', 'Missing code');
    expect(logtoError).toHaveProperty('error', error);
    expect(logtoError).toHaveProperty('errorDescription', errorDescription);
  });

  test('new LogtoError with error code, which is not related to unique message, should contain message equaling to error code', () => {
    const errorCode: LogtoErrorCode = 'callback_uri_verification';
    const error = 'error_value';
    const errorDescription = 'error_description_content';
    const logtoError = new LogtoError(errorCode, error, errorDescription);
    expect(logtoError).toHaveProperty('code', errorCode);
    expect(logtoError).toHaveProperty('message', errorCode);
    expect(logtoError).toHaveProperty('error', error);
    expect(logtoError).toHaveProperty('errorDescription', errorDescription);
  });
});
