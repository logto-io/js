import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createLogto } from "@logto/vue";
import { appId, endpoint } from "./consts";

const app = createApp(App);

app.use(createLogto, { appId, endpoint });
app.use(router);

app.mount("#app");
