import { wrap } from "async-middleware";
import { json } from "body-parser";

import gyms from "./handlers/gyms";
import sessions from "./handlers/sessions";

import type { Router } from "express";
import { Context } from "./context";

export const configure = (ctx: Context, app: Router): void => {
  app.use(json());

  app.get("/gyms", wrap(gyms.index(ctx)));

  app.get("/sessions", wrap(sessions.index(ctx)));
};
