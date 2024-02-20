# Logto Angular sample

A sample Angular application that demonstrates how to integrate Logto with `angular-auth-oidc-client`.

- **Configuration**: See [app.config.ts](src/app/app.config.ts).
- **Usage**: See [app.component.ts](src/app/app.component.ts).

For more information about `angular-auth-oidc-client`, see its [repository](https://github.com/damienbod/angular-auth-oidc-client) and official [documentation](https://angular-auth-oidc-client.com/).

## Install dependencies

This project is excluded from the workspace. To run the sample, you need to manually install project dependencies.

For PNPM users, run:

```sh
pnpm install --ignore-workspace
```

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
