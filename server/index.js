require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const { requireAuth } = require("./middleware/auth");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

let mongoReady = false;

function fallbackResponse(reason) {
  const msg =
    reason ||
    "Could not generate AI recommendations right now. Please try again.";
  return {
    roles: [],
    suggestions: [msg],
    roadmap: [],
  };
}

function extractJsonObject(text) {
  const str = String(text || "").trim();
  const first = str.indexOf("{");
  const last = str.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return str.slice(first, last + 1);
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const extracted = extractJsonObject(text);
    if (!extracted) return null;
    try {
      return JSON.parse(extracted);
    } catch (__) {
      return null;
    }
  }
}

function redactMongoUri(uri) {
  const str = String(uri || "");
  if (!str) return str;
  // Redact password if present: mongodb+srv://user:pass@host -> mongodb+srv://user:***@host
  return str.replace(/\/\/([^/:]+):([^@]+)@/g, "//$1:***@");
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign(
    { sub: String(user._id), email: user.email },
    secret,
    { expiresIn: "7d" }
  );
}

app.post("/auth/signup", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET not set" });
  }
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (!mongoReady) {
    return res.status(503).json({ error: "Database not ready" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    const token = signToken(user);
    return res.json({ token, user: { email: user.email } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err?.message || err);
    if (String(err?.code) === "11000") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: err?.message || "Signup failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET not set" });
  }
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!mongoReady) {
    return res.status(503).json({ error: "Database not ready" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    return res.json({ token, user: { email: user.email } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err?.message || err);
    return res.status(500).json({ error: "Login failed" });
  }
});

app.get("/auth/me", requireAuth, async (req, res) => {
  return res.json({ user: { email: req.user.email } });
});

app.post("/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  const chatHistory = Array.isArray(req.body?.chatHistory)
    ? req.body.chatHistory
    : [];
  const userProfile = req.body?.userProfile && typeof req.body.userProfile === "object"
    ? req.body.userProfile
    : {};

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.json({
      text: "I’m not fully online yet because the server is missing an AI API key. In the meantime, tell me: what role you’re targeting, your timeline, and your current skill level—and I’ll suggest a step-by-step plan.",
    });
  }

  const skills = String(userProfile.skills || "");
  const interests = String(userProfile.interests || "");
  const goals = String(userProfile.goals || "");

  const systemPrompt =
    "You are a professional AI career assistant. Provide personalized, actionable career advice based on the user's skills, interests, and goals. Keep responses structured and helpful.";

  const normalizedHistory = chatHistory
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    }))
    .filter((m) => m.content.trim().length > 0);

  const messages = [
    { role: "system", content: systemPrompt },
    ...normalizedHistory,
    {
      role: "user",
      content: `User Profile:
Skills: ${skills}
Interests: ${interests}
Goals: ${goals}

Question: ${message}`,
    },
  ];

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const text = String(response?.data?.choices?.[0]?.message?.content || "").trim();

    if (!text) {
      return res.json({
        text: "I didn’t get a usable response that time. Tell me your target role and timeline, and I’ll propose a focused plan with projects and interview prep.",
      });
    }

    return res.json({ text });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err?.response?.data || err?.message);
    return res.json({
      text: "I’m having trouble reaching the AI right now. For now: share your target role (or options), your timeline, and 3–5 current skills. I’ll recommend the best path and a 2-week action plan.",
    });
  }
});

app.post("/recommend", requireAuth, async (req, res) => {
  const { skills = "", interests = "", goals = "" } = req.body || {};

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.json(
      fallbackResponse("Missing OPENROUTER_API_KEY on the server.")
    );
  }

  const userContent = `Suggest career roles based on:
Skills: ${skills}
Interests: ${interests}
Goals: ${goals}

Return JSON:
{
  "roles": [],
  "suggestions": [],
  "roadmap": []
}`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [{ role: "user", content: userContent }],
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJson(content);

    if (!parsed || typeof parsed !== "object") {
      return res.json(
        fallbackResponse("AI response was not valid JSON. Please try again.")
      );
    }

    const roles = Array.isArray(parsed.roles) ? parsed.roles : [];
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
      : [];
    const roadmap = Array.isArray(parsed.roadmap) ? parsed.roadmap : [];

    const payload = { roles, suggestions, roadmap };

    // Persist user + AI output if MongoDB is available.
    if (mongoReady) {
      try {
        await User.findOneAndUpdate(
          { email: normalizeEmail(req.user.email) },
          {
            skills,
            interests,
            goals,
            recommendations: {
              roles,
              suggestions,
              roadmap,
              model: "openrouter/auto",
            },
          },
          { new: true }
        );
      } catch (dbErr) {
        // eslint-disable-next-line no-console
        console.error("Mongo save failed:", dbErr?.message || dbErr);
      }
    }

    return res.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err?.response?.data || err?.message);
    return res.json(fallbackResponse("AI request failed. Please try again."));
  }
});

const PORT = process.env.PORT || 5000;

function startServer() {
  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`CareerCraft server running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      // eslint-disable-next-line no-console
      console.error(
        `Port ${PORT} is already in use. Stop the other process, or run: npm run start:alt`
      );
      process.exit(1);
    }
    throw err;
  });
}

// Debug log requested
// eslint-disable-next-line no-console
console.log("Mongo URI:", redactMongoUri(process.env.MONGODB_URI));

if (!process.env.MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.warn("MONGODB_URI not set — starting server without MongoDB.");
  mongoReady = false;
  startServer();
} else {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      mongoReady = true;
      // eslint-disable-next-line no-console
      console.log("Connected to MongoDB ✅");
    })
    .catch(async (err) => {
      // Newer Mongo drivers reject these legacy options.
      const msg = String(err?.message || "");
      const isLegacyOptionsError = msg
        .toLowerCase()
        .includes("options usenewurlparser, useunifiedtopology are not supported");

      if (!isLegacyOptionsError) {
        mongoReady = false;
        // eslint-disable-next-line no-console
        console.error("MongoDB connection failed:", err.message);
        return;
      }

      try {
        await mongoose.connect(process.env.MONGODB_URI);
        mongoReady = true;
        // eslint-disable-next-line no-console
        console.log("Connected to MongoDB ✅");
      } catch (err2) {
        mongoReady = false;
        // eslint-disable-next-line no-console
        console.error("MongoDB connection failed:", err2?.message || err2);
      }
    })
    .finally(() => {
      // Ensure we don't start before attempting MongoDB connection.
      startServer();
    });
}

