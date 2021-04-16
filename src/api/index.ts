import express from "express";
import { connect } from "../db";
import { configure } from "./routes";

const main = async () => {
  const ctx = {
    db: connect(),
  };

  const app = express();

  configure(ctx, app);

  const port = process.env.PORT || 3030;
  app.listen(port, () => {
    console.log(`listening on port ${port}...`);
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
