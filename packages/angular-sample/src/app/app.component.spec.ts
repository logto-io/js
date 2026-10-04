import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import {
  LogtoService,
  type IdTokenClaims,
  type UserInfoResponse,
} from "@logto/angular";

import { AppComponent } from "./app.component";
import { apiResources } from "./logto.config";

const userInfo: UserInfoResponse = {
  iss: "https://logto.example/oidc",
  sub: "user-id",
  aud: "app-id",
  exp: 2_000_000_000,
  iat: 1_900_000_000,
};
const idTokenClaims: IdTokenClaims = {
  iss: "https://logto.example/oidc",
  sub: "user-id",
  aud: "app-id",
  exp: 2_000_000_000,
  iat: 1_900_000_000,
};

const createLogto = () => ({
  isAuthenticated: signal(false),
  isLoading: signal(false),
  error: signal<Error | undefined>(undefined),
  signIn: jasmine.createSpy("signIn").and.resolveTo(),
  signOut: jasmine.createSpy("signOut").and.resolveTo(),
  fetchUserInfo: jasmine.createSpy("fetchUserInfo").and.resolveTo(userInfo),
  getIdTokenClaims: jasmine
    .createSpy("getIdTokenClaims")
    .and.resolveTo(idTokenClaims),
  getAccessTokenClaims: jasmine
    .createSpy("getAccessTokenClaims")
    .and.resolveTo({ sub: "user-id" }),
  getOrganizationTokenClaims: jasmine
    .createSpy("getOrganizationTokenClaims")
    .and.resolveTo({ sub: "user-id", organization_id: "organization-id" }),
});

describe("AppComponent", () => {
  const logto = createLogto();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: LogtoService, useValue: logto },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    logto.isAuthenticated.set(false);
    logto.isLoading.set(false);
    logto.error.set(undefined);
  });

  it("renders the title and signed-out action", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.title).toBe("@logto/angular-sample");
    expect(compiled.querySelector("h1")?.textContent).toContain(
      "@logto/angular-sample",
    );
    expect(compiled.querySelector("button")?.textContent).toContain("Sign in");
  });

  it("starts sign-in and sign-out with application URLs", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    await component.signIn();
    await component.signOut();

    expect(logto.signIn).toHaveBeenCalledWith({
      redirectUri: `${window.location.origin}/callback`,
      postRedirectUri: window.location.origin,
    });
    expect(logto.signOut).toHaveBeenCalledWith(window.location.origin);
  });

  it("loads claims through resource-aware SDK methods", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    await component.loadUserInfo();
    await component.loadIdTokenClaims();
    await component.loadAccessTokenClaims(apiResources[1]);
    await component.loadOrganizationTokenClaims("organization-id");

    expect(logto.fetchUserInfo).toHaveBeenCalled();
    expect(logto.getIdTokenClaims).toHaveBeenCalled();
    expect(logto.getAccessTokenClaims).toHaveBeenCalledWith(apiResources[1]);
    expect(logto.getOrganizationTokenClaims).toHaveBeenCalledWith(
      "organization-id",
    );
    expect(component.userInfo()).toBe(userInfo);
    expect(component.organizationTokenClaims()).toEqual({
      sub: "user-id",
      organization_id: "organization-id",
    });
  });
});
