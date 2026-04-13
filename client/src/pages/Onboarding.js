import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { HelperText, Label, Textarea } from "../components/ui/Field";

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
    </div>
  );
}

export function Onboarding() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();

  const [skills, setSkills] = useState(profile.skills);
  const [interests, setInterests] = useState(profile.interests);
  const [goals, setGoals] = useState(profile.goals);

  const canSubmit = useMemo(() => {
    return (skills + interests + goals).trim().length > 0;
  }, [skills, interests, goals]);

  function onSubmit(e) {
    e.preventDefault();
    saveProfile({ skills, interests, goals });
    navigate("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Build your career profile"
              subtitle="Add a few lines about what you know and what you want. Use commas or new lines."
            />
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., React, JavaScript, SQL, communication, problem-solving"
                  rows={4}
                />
                <HelperText>
                  Include tools, languages, and “soft skills”.
                </HelperText>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Textarea
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., UI design, fintech, data visualization, startups"
                  rows={4}
                />
                <HelperText>
                  What topics energize you? Domains, products, problems.
                </HelperText>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Career goals</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g., Get a junior frontend role in 3 months; build a portfolio; improve interview readiness"
                  rows={4}
                />
                <HelperText>
                  Mention timeline, target role, constraints, or priorities.
                </HelperText>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" disabled={!canSubmit}>
                  Generate recommendations
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-white">Tips</p>
              <p className="mt-1 text-xs text-slate-300">
                Make inputs specific for better recommendations.
              </p>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-semibold text-white">Be concrete</p>
                <p className="mt-1">
                  Prefer “React, Tailwind, REST APIs” over “web development”.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-semibold text-white">Include constraints</p>
                <p className="mt-1">
                  Mention your timeline and weekly hours to plan realistically.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-semibold text-white">Use the chatbot</p>
                <p className="mt-1">
                  Ask for a 2-week plan, portfolio projects, or interview prep.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
            <CardBody>
              <p className="text-sm font-semibold text-white">
                Example prompt for chat
              </p>
              <p className="mt-2 text-sm text-slate-200">
                “I can study 8 hours/week. Which role should I pick, and what
                should I do in the next 14 days?”
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

