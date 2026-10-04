# Next Sample (server actions)

This is a sample project for Logto's Next.js SDK (server actions).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flogto-io%2Fjs%2Fblob%2Fmaster%2Fpackages%2Fnext-server-actions-sample&env=APP_ID,APP_SECRET,ENDPOINT,BASE_URL,COOKIE_SECRET&envDescription=Configuration%20needed%20to%20init%20Logto%20client&envLink=https%3A%2F%2Fgithub.com%2Flogto-io%2Fjs%2Fblob%2Fmaster%2Fpackages%2Fnext-server-actions-sample%2FREADME.md%23configuration)

## Configuration

You can configure the sample project by modifying the `libraries/config.js` file, or by setting the following environment variables:

| key           | description                                             | example                                          |
| ------------- | ------------------------------------------------------- | ------------------------------------------------ |
| APP_ID        | The app ID of your application                          | `my-app`                                         |
| APP_SECRET    | The app secret of your application                      | `my-secret`                                      |
| ENDPOINT      | The endpoint of your Logto server                       | `http://localhost:3001`                          |
| BASE_URL      | The base URL of this application                        | `http://localhost:3000`                          |
| COOKIE_SECRET | The secret for cookie encryption                        | `my-cookie-secret`                               |
| RESOURCES     | Optional, the API resource identifier, split with comma | `http://localhost:3003/,http://localhost:3004/` |
| SCOPES        | Optional, the scopes to grant, split with comma         | `read:users,write:users`                         |

Learn more about resource and scopes in the [Logto RBAC Documentation](https://docs.logto.io/docs/recipes/rbac/protect-resource#configure-client-sdk).
