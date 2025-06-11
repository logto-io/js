# (Draft) Contribute to Logto JavaScript SDKs monorepo

Thanks for your interest in contributing to Logto. We respect the time of community contributors, so it'll be great if we can go through this guide which provides the necessary contribution information before starting your work.

This repository contains the source code of Logto JavaScript SDKs. For other languages, please refer to the [Logto organization](https://github.com/logto-io) for more information.

**Table of contents**

- [(Draft) Contribute to Logto JavaScript SDKs monorepo](#draft-contribute-to-logto-javascript-sdks-monorepo)
  - [Contribution Type](#contribution-type)
    - [Bug fixes](#bug-fixes)
    - [New SDKs](#new-sdks)
    - [SDK updates](#sdk-updates)
  - [Set up a Logto instance](#set-up-a-logto-instance)
  - [Make changes](#make-changes)
  - [Test the changes](#test-the-changes)
  - [Run the sample project](#run-the-sample-project)
  - [Commit and create pull request](#commit-and-create-pull-request)

## Contribution Type

### Bug fixes

We ensure most of the SDKs run correctly with unit tests and sample projects. However, there's still a chance of missing or getting wrong on something.

If something doesn't work as expected, search in [Issues](https://github.com/logto-io/js/issues) to see if someone has reported the issue.

- If an issue already exists, comment to say you're willing to take it.
- If not, create one before continuing. It'll be great to let other people know you found it and will fix it.

Usually, we'll confirm the details in the issue thread, and you can work on the Pull Request in the meantime.

> **Warning**
> 
> Do not report a security issue directly in the public GitHub Issues, since someone may take advantage of it before the fix. Send an email to [security@logto.io](mailto:security@logto.io) instead.

### New SDKs

Logto covers lots of platforms and frameworks, so we're always looking for new SDKs to support.

Before starting the work, join our [Discord channel](https://discord.gg/cyWnux4cH6) or [email us](mailto:contact@logto.io) to double-check if there's an ongoing project for your desired SDK. We'll confirm with you your need and the status quo.

### SDK updates

If you can find an SDK, but it's not up to date to the target platform or framework, you can update it.

## Set up a Logto instance

Before starting the work, we suggest you to set up a Logto instance to test the SDK. You can either use the [Logto Cloud](https://cloud.logto.io) or [Logto OSS](https://docs.logto.io/introduction/set-up-logto-oss). Then prepare an application for your SDK in the Admin Console. Have the necessary information ready, such as the application ID, application secret, and Logto endpoint.

## Make changes

Go to the folder of the SDK you want to work on, and start to make changes.

## Test the changes

Run the unit tests to make sure the changes are working as expected.

## Run the sample project

Build your SDK and run the sample project to make sure the SDK is working as expected.

## Commit and create pull request

We require every commit to [be signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits), and both the commit message and pull request title follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

You can find repo-specific config in `commitlint.config.js`, if applicable.

If the pull request remains empty content, it'll be DIRECTLY CLOSED until it matches our contributing guideline.
