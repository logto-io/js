import { UserScope, type LogtoConfig } from "@logto/angular";

export const apiResources = [
  "https://resource-1.example.com/api",
  "https://resource-2.example.com/api",
];

export const logtoConfig = {
  endpoint: "<your-logto-endpoint>",
  appId: "<your-app-id>",
  scopes: [UserScope.Email, UserScope.Organizations],
  resources: apiResources,
} satisfies LogtoConfig;
