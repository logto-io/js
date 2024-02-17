import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import type { UserInfoResponse } from '@logto/js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = '@logto/angular-sample';
  isAuthenticated = false;
  userData?: UserInfoResponse;
  idToken?: string;
  accessToken?: string;

  constructor(public oidcSecurityService: OidcSecurityService) { }

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData, idToken, accessToken }) => {
      console.log('app authenticated', isAuthenticated, userData);
      this.isAuthenticated = isAuthenticated;
      this.userData = userData;
      this.idToken = idToken;
      this.accessToken = accessToken;
    });
  }

  signIn() {
    this.oidcSecurityService.authorize();
  }

  signOut() {
    this.oidcSecurityService.logoff().subscribe((result) => {
      console.log('app sign-out', result);
      this.isAuthenticated = false;
    });
  }
}
