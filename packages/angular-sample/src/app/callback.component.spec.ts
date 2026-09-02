import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { LogtoService } from "@logto/angular";

import { CallbackComponent } from "./callback.component";

describe("CallbackComponent", () => {
  it("handles the current URL after the first browser render", async () => {
    const isSignInRedirected = jasmine
      .createSpy("isSignInRedirected")
      .and.resolveTo(true);
    const handleSignInCallback = jasmine
      .createSpy("handleSignInCallback")
      .and.resolveTo();
    const logto = {
      error: signal<Error | undefined>(undefined),
      isLoading: signal(true),
      isSignInRedirected,
      handleSignInCallback,
    };
    await TestBed.configureTestingModule({
      imports: [CallbackComponent],
      providers: [{ provide: LogtoService, useValue: logto }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CallbackComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(isSignInRedirected).toHaveBeenCalledOnceWith(window.location.href);
    expect(handleSignInCallback).toHaveBeenCalledOnceWith(window.location.href);
  });

  it("ignores a visit without an active sign-in session", async () => {
    const isSignInRedirected = jasmine
      .createSpy("isSignInRedirected")
      .and.resolveTo(false);
    const handleSignInCallback = jasmine
      .createSpy("handleSignInCallback")
      .and.resolveTo();
    const logto = {
      error: signal<Error | undefined>(undefined),
      isLoading: signal(false),
      isSignInRedirected,
      handleSignInCallback,
    };
    await TestBed.configureTestingModule({
      imports: [CallbackComponent],
      providers: [{ provide: LogtoService, useValue: logto }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CallbackComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(isSignInRedirected).toHaveBeenCalledOnceWith(window.location.href);
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });
});
