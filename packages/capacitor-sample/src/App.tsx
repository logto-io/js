import { useEffect, useState } from "react";
import { getUserClaims, logtoClient, signIn, signOut } from "./logtoClient";

type Claims = Awaited<ReturnType<typeof getUserClaims>>;

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #222",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

export default function App() {
  const [claims, setClaims] = useState<Claims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authenticated = await logtoClient.isAuthenticated();

        if (!authenticated) {
          if (active) {
            setClaims(null);
          }
          return;
        }

        const value = await getUserClaims();

        if (active) {
          setClaims(value ?? null);
        }
      } catch {
        if (active) {
          setClaims(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
      const value = await getUserClaims();

      setClaims(value ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut();
      setClaims(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed");
    }
  };

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1>Logto Capacitor + React</h1>
      {loading ? (
        <p>Loading session…</p>
      ) : claims ? (
        <div>
          <p>Signed in</p>
          <pre
            style={{
              background: "#f6f6f6",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(claims, null, 2)}
          </pre>
          <button style={buttonStyle} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      ) : (
        <div>
          <p>Not signed in.</p>
          <button
            style={{
              ...buttonStyle,
              opacity: signingIn ? 0.7 : 1,
              cursor: signingIn ? "default" : "pointer",
            }}
            onClick={handleSignIn}
            disabled={signingIn}
          >
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
        </div>
      )}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
    </div>
  );
}
