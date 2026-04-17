import { auth } from "express-oauth2-jwt-bearer";
import { env } from "../config/env.js";

const demoUser = {
  sub: "demo|local-user",
  email: "demo@text-to-learn.local",
  name: "Demo Learner"
};

const checkJwt = env.hasAuth0
  ? auth({
      audience: env.auth0Audience,
      issuerBaseURL: env.auth0IssuerBaseUrl,
      tokenSigningAlg: "RS256"
    })
  : null;

export const attachUser = [
  ...(checkJwt ? [checkJwt] : []),
  (req, _res, next) => {
    if (!env.hasAuth0) {
      req.user = demoUser;
      return next();
    }

    const payload = req.auth?.payload || {};
    req.user = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.nickname || payload.sub
    };
    next();
  }
];
