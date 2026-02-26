import { LogtoProvider, type LogtoConfig, UserScope } from "@logto/solid";
import { type RouteDefinition, Router } from "@solidjs/router";
import {lazy} from "solid-js";

import "./app.css";
import { appId, endpoint } from './consts';

const routes: RouteDefinition[] = [
  { path: '/', component: lazy(() => import("./pages/Home")) },
  { path: '/callback', component: lazy(() => import("./pages/Callback")) },
  { path: '/protected', component: lazy(() => import("./pages/ProtectedResource")) },
  { path: '/protected/organizations', component: lazy(() => import("./pages/Organizations")) },
];

export function App() {
  const config: LogtoConfig = {
    appId,
    endpoint,
    scopes: [
      UserScope.Email,
      UserScope.Phone,
      UserScope.CustomData,
      UserScope.Identities,
      UserScope.Organizations,
    ],
  };
  return (
    <LogtoProvider config={config}>
      <div class="flex flex-col min-h-screen">
        <Router>{routes}</Router>
      </div>
    </LogtoProvider>
  );
}
