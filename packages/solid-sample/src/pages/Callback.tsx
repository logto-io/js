import { useHandleSignInCallback } from '@logto/solid';
import { useNavigate } from '@solidjs/router';
import { Show } from 'solid-js';

export default function Callback() {
  const navigate = useNavigate();
  const { isLoading } = useHandleSignInCallback(() => {
    console.log("???")
    navigate('/');
  });

  return <Show when={isLoading()}>
    <p>Redirecting...</p>
  </Show>
};
