# PassportJS sample

## Introduction

This project provides a minimal code demonstration for integrating Logto authentication in a PassportJS application. It utilizes the `passport-openidconnect` plugin, offering a simple yet effective way to incorporate Logto for authentication purposes.

## Setup and usage

To get started:

1. In Logto Console, create an application with type "Traditional Web App".
2. Obtain the necessary values from the Application details in Logto.
3. Set up the following environment variables:

| Environment Variable | Description           | Example                     |
| -------------------- | --------------------- | --------------------------- |
| `APP_ID`             | App ID from Logto     | `4ukboxxxxxxxxx`            |
| `APP_SECRET`         | App Secret from Logto | `5aqccxxxxxxx`              |
| `ENDPOINT`           | Logto Endpoint        | `https://g5xxx.logto.app/` |

## Sample routes

The demonstration includes four key routes:

1. `/sign-in` - Begins the sign-in process.
2. `/sign-out` - Triggers the sign-out process.
3. `/callback` - Manages the callback post-authentication.
4. `/` (index) - Displays login status and user information if logged in, or a sign-in button if not.

## Additional resources

- [PassportJS](http://www.passportjs.org/)
- [Passport-OpenIDConnect](https://www.passportjs.org/packages/passport-openidconnect/)
