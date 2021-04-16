import type { Handler as ExpressHandler } from "express";
import type { Context } from "../context";

export type Handler = (ctx: Context) => ExpressHandler;
