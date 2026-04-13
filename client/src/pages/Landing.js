import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

function Feature({ title, desc }) {
  return (
    <Card className="h-full">
      <CardBody>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-300">{desc}</p>
      </CardBody>
    </Card>
  );
}

export function Landing() {
  return (
    <div className="relative z-10">
      <header className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20">
              <span className="text-sm font-black tracking-tight text-white">
                CC
              </span>
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              CareerCraft AI
            </span>
          </div>
          <Link
            to="/dashboard"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 md:pb-20 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              Personalized career guidance
              <span className="h-1 w-1 rounded-full bg-slate-400" />
              role-fit + next steps
            </p>
            <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Build a career plan that actually fits you.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-300">
              Share your skills, interests, and goals. CareerCraft generates
              clear role recommendations, learning paths, and project ideas—then
              you can iterate with an always-on chatbot.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/onboarding">
                <Button className="w-full sm:w-auto">
                  Get tailored recommendations
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="subtle" className="w-full sm:w-auto">
                  Explore dashboard
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Clean UI
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Responsive
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Cards + shadows
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Tailwind CSS
              </span>
            </div>
          </div>

          <div className="relative">
            <Card className="overflow-hidden">
              <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/15 to-fuchsia-500/15 p-5">
                <p className="text-sm font-semibold text-white">
                  Your snapshot
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Example inputs → recommendations
                </p>
              </div>
              <CardBody>
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-xs font-semibold text-slate-300">
                      Skills
                    </p>
                    <p className="mt-1 text-sm text-white">
                      React, JavaScript, UI, SQL
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-xs font-semibold text-slate-300">
                      Interests
                    </p>
                    <p className="mt-1 text-sm text-white">
                      Product building, design systems, data
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-xs font-semibold text-slate-300">
                      Top roles
                    </p>
                    <p className="mt-1 text-sm text-white">
                      Frontend Engineer · Product Designer · Data Analyst
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Feature
                title="Role-fit recommendations"
                desc="A ranked list of roles with “why this fits” and next steps."
              />
              <Feature
                title="Chatbot copilot"
                desc="Refine goals, pick a path, and get a weekly action plan."
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-400">
        Built with React + Tailwind. UI scaffold only (no backend).
      </footer>
    </div>
  );
}

