import type LogtoClient from '@logto/node';
import type { UserInfoResponse } from '@logto/node';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // Interface Error {}
    interface Locals {
      logtoClient: LogtoClient;
      user?: UserInfoResponse;
    }
    // Interface PageData {
    // 	count: number;
    // }
    // interface PageState {}
    // interface Platform {}
  }
}
