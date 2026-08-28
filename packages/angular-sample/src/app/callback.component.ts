import { afterNextRender, Component, inject } from "@angular/core";
import { LogtoService } from "@logto/angular";

@Component({
  selector: "app-callback",
  standalone: true,
  template: `
    @if (logto.error(); as error) {
    <p role="alert">{{ error.message }}</p>
    } @else if (logto.isLoading()) {
    <p>Completing sign-in…</p>
    } @else {
    <p>Sign-in complete.</p>
    }
  `,
})
export class CallbackComponent {
  readonly logto = inject(LogtoService);

  constructor() {
    afterNextRender(() => {
      void this.logto
        .handleSignInCallback(window.location.href)
        .catch(() => undefined);
    });
  }
}
