import { Logger, ILogObj } from "tslog";
import express, { Application, Request, Response } from "express";
import figlet from "figlet";
import bodyParser from "body-parser";
import morgan from "morgan";
import Router from "./routes";

const app: Application = express();

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(express.static("public"));

app.use(Router);

const log: Logger<ILogObj> = new Logger();

app.get("*", (req, res) => {
  return res.status(200).send();
});

const port: number = Number(process?.env?.PORT || 8099);
log.info(`Starting server on port ${port}`);

app.listen(port, () => {
  const CardanoService = figlet.textSync("CardanoServiceV3");
  console.log(CardanoService);
  log.info(`Listening on http://localhost:${port}`);
});