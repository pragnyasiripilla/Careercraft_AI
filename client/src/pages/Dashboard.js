import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { HelperText, Label, Textarea } from "../components/ui/Field";
import { Navbar } from "../components/layout/Navbar";
import { ChatbotPanel } from "../components/chat/ChatbotPanel";

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

function RecommendationCard({ rec }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold text-white">{rec.title}</p>
            <p className="mt-1 text-sm text-slate-300">{rec.why}</p>
          </div>
          <span className="rounded-xl border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs font-semibold text-slate-200">
            score {rec.score}
          </span>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-xs font-semibold text-slate-300">Next steps</p>
        <ul className="mt-2 space-y-2 text-sm text-slate-200">
          {rec.nextSteps.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, recommendations, reset, saveProfile } = useProfile();

  const [skills, setSkills] = useState(profile.skills);
  const [interests, setInterests] = useState(profile.interests);
  const [goals, setGoals] = useState(profile.goals);

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiResult, setApiResult] = useState(null);

  const hasProfile = useMemo(() => {
    return (profile.skills + profile.interests + profile.goals).trim().length > 0;
  }, [profile]);

  const headerText = hasProfile
    ? "Your recommendations"
    : "Recommendations (demo)";

  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    if (!token) navigate("/login");
  }, [navigate]);

  async function submitToBackend() {
    const endpoint = "http://localhost:5000/recommend";
    setApiLoading(true);
    setApiError("");

    try {
      const token = localStorage.getItem("cc_token");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ skills, interests, goals }),
      });

      if (!res.ok) {
        const maybeText = await res.text().catch(() => "");
        throw new Error(
          maybeText || `Request failed with status ${res.status}`
        );
      }

      const data = await res.json();
      setApiResult({
        roles: Array.isArray(data?.roles) ? data.roles : [],
        suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
      });
    } catch (err) {
      setApiResult(null);
      setApiError(
        err?.message ||
          "Could not reach the backend. Is the server running on port 5000?"
      );
    } finally {
      setApiLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-fuchsia-500 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              {headerText}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Update your profile and instantly see role recommendations. Use
              the floating chatbot to turn one option into an actionable plan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>Multi-page routing</Pill>
              <Pill>Tailwind UI</Pill>
              <Pill>Responsive cards</Pill>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                reset();
                setSkills("");
                setInterests("");
                setGoals("");
                setApiResult(null);
                setApiError("");
              }}
            >
              Reset
            </Button>
            <Button
              variant="subtle"
              className="w-full sm:w-auto"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-white">Your profile</p>
              <p className="mt-1 text-xs text-slate-300">
                Skills, interests, and goals drive the recommendations.
              </p>
            </CardHeader>
            <CardBody>
              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  saveProfile({ skills, interests, goals });
                  await submitToBackend();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., React, JavaScript, SQL, communication"
                    rows={4}
                  />
                  <HelperText>
                    Use commas or new lines. Include tools + soft skills.
                  </HelperText>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Textarea
                    id="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g., UI design, fintech, data visualization"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Career goals</Label>
                  <Textarea
                    id="goals"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="e.g., Junior frontend role in 3 months; portfolio + interview prep"
                    rows={4}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" disabled={apiLoading}>
                    {apiLoading ? "Getting results…" : "Save & get results"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={apiLoading}
                    onClick={async () => {
                      saveProfile({ skills, interests, goals });
                      await submitToBackend();
                    }}
                  >
                    Fetch from API
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <p className="text-sm font-semibold text-white">
                  Backend results
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  From <span className="font-semibold">POST /recommend</span>
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                {apiError ? (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                    <p className="font-semibold text-rose-100">Request failed</p>
                    <p className="mt-1 text-rose-200/90">{apiError}</p>
                    <p className="mt-2 text-xs text-rose-200/80">
                      Tip: make sure you are logged in and the backend is running.
                    </p>
                  </div>
                ) : apiLoading ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    Fetching recommendations…
                  </div>
                ) : apiResult ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Recommended roles
                      </p>
                      {apiResult.roles.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {apiResult.roles.map((r) => (
                            <span
                              key={r}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-300">—</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Suggestions
                      </p>
                      {apiResult.suggestions.length ? (
                        <ul className="mt-2 space-y-2 text-sm text-slate-200">
                          {apiResult.suggestions.map((s) => (
                            <li key={s} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-fuchsia-400" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-300">—</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    Submit the form to fetch roles and suggestions from the
                    backend.
                  </div>
                )}
              </CardBody>
            </Card>

            {!hasProfile && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                Add your skills/interests/goals to personalize this list.
              </div>
            )}

            <div className="grid gap-5">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.title} rec={rec} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-white">Saved inputs</p>
              <p className="mt-1 text-xs text-slate-300">
                What recommendations are based on
              </p>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-300">Skills</p>
                <p className="mt-1 text-sm text-white">
                  {profile.skills || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">Interests</p>
                <p className="mt-1 text-sm text-white">
                  {profile.interests || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">
                  Career goals
                </p>
                <p className="mt-1 text-sm text-white">{profile.goals || "—"}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
            <CardHeader>
              <p className="text-sm font-semibold text-white">Chatbot</p>
              <p className="mt-1 text-xs text-slate-300">
                Floating panel (UI only)
              </p>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-slate-200">
              <p>
                Ask: “Which role should I pick and what should I do this week?”
              </p>
              <p className="text-slate-300">
                Later you can connect it to a real LLM API.
              </p>
            </CardBody>
          </Card>
        </div>
      </main>

      <ChatbotPanel />
    </div>
  );
}

