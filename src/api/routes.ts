import { wrap } from "async-middleware";
import { json } from "body-parser";

import gyms from "./handlers/gyms";
import snapshots from "./handlers/snapshots";
import sessions from "./handlers/sessions";
import report from "./handlers/report";

import type { Router } from "express";
import { Context } from "./context";

export const configure = (ctx: Context, app: Router): void => {
  app.use(json());

  app.get("/snapshots/:id", wrap(snapshots.get(ctx)));

  app.get("/gyms", wrap(gyms.index(ctx)));
  app.get("/gyms/:idOrSlug", wrap(gyms.get(ctx)));

  app.get("/sessions", wrap(sessions.index(ctx)));

  app.post("/report", wrap(report.post(ctx)));
};
