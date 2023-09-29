"use server";

import LogtoClient from "@logto/next/server-actions";
import { cookies } from "next/headers";

const config = {
  appId: process.env.APP_ID ?? "<app-id>",
  appSecret: process.env.APP_SECRET ?? "<app-secret>",
  endpoint: process.env.ENDPOINT ?? "http://localhost:3001",
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  cookieSecret:
    process.env.COOKIE_SECRET ?? "complex_password_at_least_32_characters_long",
  cookieSecure: process.env.NODE_ENV === "production",
  // Optional fields for RBAC
  resources: process.env.RESOURCES?.split(","),
  scopes: process.env.SCOPES?.split(","),
};

const logtoClient = new LogtoClient(config);

const cookieName = `logto:${config.appId}`;

const setCookies = (value?: string) => {
  if (value === undefined) {
    return;
  }

  cookies().set(cookieName, value, {
    maxAge: 14 * 3600 * 24,
    secure: config.cookieSecure,
  });
};

const getCookie = () => {
  return cookies().get(cookieName)?.value ?? "";
};

export const signIn = async () => {
  const { url, newCookie } = await logtoClient.handleSignIn(
    getCookie(),
    `${config.baseUrl}/callback`
  );

  setCookies(newCookie);

  return url;
};

export const handleSignIn = async (searchParams: Record<string, string>) => {
  // Convert searchParams object into a query string.
  const search = new URLSearchParams(searchParams).toString();

  const newCookie = await logtoClient.handleSignInCallback(
    getCookie(),
    `${config.baseUrl}/callback?${search}`
  );

  setCookies(newCookie);
};

export const signOut = async () => {
  const url = await logtoClient.handleSignOut(
    getCookie(),
    `${config.baseUrl}/callback`
  );

  setCookies('');

  return url;
};

export const getLogtoContext = async () => {
  return await logtoClient.getLogtoContext(getCookie());
};
