function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[,\n]/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

function scoreFor(role, tokens) {
  const roleTokens = tokenize(role.keywords.join(","));
  const matches = roleTokens.filter((t) => tokens.includes(t)).length;
  return matches;
}

const ROLE_CATALOG = [
  {
    title: "Frontend Engineer",
    keywords: ["react", "javascript", "ui", "css", "tailwind", "typescript"],
    why: "Strong fit for building polished product experiences and modern interfaces.",
    nextSteps: ["Ship 2 responsive UIs", "Learn accessibility basics", "Practice system design for UI"],
  },
  {
    title: "Backend Engineer",
    keywords: ["api", "node", "python", "sql", "databases", "auth", "redis"],
    why: "Great for building reliable services, APIs, and scalable data systems.",
    nextSteps: ["Build a REST API", "Add auth + rate limiting", "Model data + migrations"],
  },
  {
    title: "Data Analyst",
    keywords: ["excel", "sql", "python", "pandas", "visualization", "dashboards"],
    why: "Ideal if you enjoy extracting insights and communicating with data.",
    nextSteps: ["Create a dashboard", "Learn joins/window functions", "Do a mini case study"],
  },
  {
    title: "AI / ML Engineer",
    keywords: ["machine learning", "python", "pytorch", "llm", "nlp", "statistics"],
    why: "Good match if you're excited by modeling, experimentation, and AI products.",
    nextSteps: ["Train a small model", "Build an evaluation loop", "Deploy an inference API"],
  },
  {
    title: "Product Designer",
    keywords: ["design", "ux", "research", "prototyping", "figma", "ui"],
    why: "Perfect if you like crafting flows, usability, and visual systems.",
    nextSteps: ["Redesign a real flow", "Run 3 user interviews", "Build a design system page"],
  },
  {
    title: "Cybersecurity Analyst",
    keywords: ["security", "networking", "linux", "owasp", "threats"],
    why: "Great if you enjoy protecting systems and learning how attackers think.",
    nextSteps: ["Learn OWASP Top 10", "Set up a home lab", "Do a CTF starter track"],
  },
];

export function buildRecommendations(profile) {
  const tokens = [
    ...tokenize(profile.skills),
    ...tokenize(profile.interests),
    ...tokenize(profile.goals),
  ];

  const ranked = ROLE_CATALOG.map((role) => ({
    title: role.title,
    why: role.why,
    nextSteps: role.nextSteps,
    score: scoreFor(role, tokens),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // If user entered nothing, show a sensible default ordering.
  if (!tokens.length) {
    return ROLE_CATALOG.slice(0, 4).map((r) => ({
      title: r.title,
      why: r.why,
      nextSteps: r.nextSteps,
      score: 0,
    }));
  }

  return ranked;
}

