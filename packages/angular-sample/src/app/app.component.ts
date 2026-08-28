import { JsonPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {
  LogtoService,
  type AccessTokenClaims,
  type IdTokenClaims,
  type UserInfoResponse,
} from "@logto/angular";

import { apiResources } from "./logto.config";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [JsonPipe, RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  readonly title = "@logto/angular-sample";
  readonly apiResources = apiResources;
  readonly logto = inject(LogtoService);
  readonly userInfo = signal<UserInfoResponse | undefined>(undefined);
  readonly idTokenClaims = signal<IdTokenClaims | undefined>(undefined);
  readonly accessTokenClaims = signal<AccessTokenClaims | undefined>(undefined);
  readonly organizationTokenClaims = signal<AccessTokenClaims | undefined>(
    undefined,
  );

  async signIn() {
    await this.logto.signIn({
      redirectUri: `${window.location.origin}/callback`,
      postRedirectUri: window.location.origin,
    });
  }

  async signOut() {
    await this.logto.signOut(window.location.origin);
  }

  async loadUserInfo() {
    this.userInfo.set(await this.logto.fetchUserInfo());
  }

  async loadIdTokenClaims() {
    this.idTokenClaims.set(await this.logto.getIdTokenClaims());
  }

  async loadAccessTokenClaims(resource: string) {
    this.accessTokenClaims.set(await this.logto.getAccessTokenClaims(resource));
  }

  async loadOrganizationTokenClaims(organizationId: string) {
    this.organizationTokenClaims.set(
      await this.logto.getOrganizationTokenClaims(organizationId),
    );
  }
}
