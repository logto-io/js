import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createLogto, UserScope } from "@logto/vue";
import { appId, endpoint } from "./consts";

const app = createApp(App);

app.use(createLogto, {
  appId,
  endpoint,
  scopes: [
    UserScope.Email,
    UserScope.Phone,
    UserScope.CustomData,
    UserScope.Identities,
  ],
});
app.use(router);

app.mount("#app");
