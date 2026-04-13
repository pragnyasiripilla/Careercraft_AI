const jwt = require("jsonwebtoken");

function getTokenFromRequest(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "JWT_SECRET not set" });

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (_) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAuth };

