import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { HelperText, Input, Label } from "../components/ui/Field";

export function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canLogin = useMemo(() => {
    return email.trim().length > 3 && password.trim().length > 0;
  }, [email, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint =
        mode === "signup"
          ? "http://localhost:5000/auth/signup"
          : "http://localhost:5000/auth/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");

      if (data?.token) {
        localStorage.setItem("cc_token", data.token);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-fuchsia-500 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-6 md:grid-cols-2 md:items-center">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20">
                <span className="text-sm font-black tracking-tight text-white">
                  CC
                </span>
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">
                CareerCraft AI
              </span>
            </Link>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
              {mode === "signup" ? "Create account" : "Login"}
            </h1>
            <p className="mt-3 max-w-md text-sm text-slate-300">
              {mode === "signup"
                ? "Create an account to save your profile and recommendations."
                : "Login to access your dashboard and saved recommendations."}
            </p>
          </div>

          <Card className="md:justify-self-end md:w-[420px]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">
                  {mode === "signup" ? "Sign up" : "Welcome back"}
                </p>
                <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      mode === "login"
                        ? "bg-white text-slate-950"
                        : "text-slate-200 hover:bg-white/5",
                    ].join(" ")}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      mode === "signup"
                        ? "bg-white text-slate-950"
                        : "text-slate-200 hover:bg-white/5",
                    ].join(" ")}
                  >
                    Sign up
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Enter your email and password to continue.
              </p>
            </CardHeader>
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <HelperText>
                    {mode === "signup"
                      ? "Use at least 6 characters."
                      : "Enter the password for your account."}
                  </HelperText>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canLogin || loading}
                >
                  {loading
                    ? "Please wait…"
                    : mode === "signup"
                      ? "Create account"
                      : "Login"}
                </Button>

                <p className="text-center text-xs text-slate-400">
                  New here?{" "}
                  <Link
                    to="/"
                    className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
                  >
                    Go back home
                  </Link>
                </p>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

