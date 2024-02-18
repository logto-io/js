import type { UserInfoResponse, LogtoClient } from '@logto/sveltekit';

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
