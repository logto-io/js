import { useLogto } from "@logto/solid";
import { createSignal, Show } from "solid-js";
import { resource } from "../consts";

const ProtectedResource = () => {
  const { isAuthenticated, isLoading, signIn, getAccessToken } = useLogto();
  const [accessToken, setAccessToken] = createSignal<string>();
  const handleClick = async () => {
    const token = await getAccessToken(resource);
    setAccessToken(token);
  };
  return (
    <section>
      <a href="/">Go back</a>
      <Show when={isAuthenticated()}>
        <p>Protected resource is only visible after sign-in.</p>
      </Show>
      <button type="button" onClick={handleClick}>Get access token</button>
      <Show when={accessToken()}>
        Access token: <code>{accessToken()}</code>
      </Show>
</section>
)
  ;
};

export default ProtectedResource;
