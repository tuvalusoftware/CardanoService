import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { routers } from "./routers";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./api-docs";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Cardano Service",
  customfavIcon: "https://fuixlabs.com/img/favicons/favicon.ico"
}));

import Logger from "./Logger";

const whitelist = [
  "https://cardano-fuixlabs.ap.ngrok.io",
  // "https://docrender-fuixlabs.ap.ngrok.io",
  // "https://auth-fuixlabs.ap.ngrok.io",
  "https://paperless-fuixlabs.ap.ngrok.io",
  // "https://github-fuixlabs.ap.ngrok.io",
  "https://resolver-fuixlabs.ap.ngrok.io",
  // "http://localhost:4000"
  // "http://localhost:8000"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("NOT_ALLOWEB_BY_CORS"));
    }
  }
};

app.use(cors(corsOptions));

export const start = async (params) => {
  routers(app);

  app.use((err, req, res, next) => {
    res.status(200).json({
      code: err.error_code || 1,
      message: err.message,
      data: err.data || null,
    });
  });

  server.listen(params.port || 80, () => {
    Logger.info(`Listening on http://localhost${params.port ? `:${params.port}` : ""}`);
    if (params && params.done) {
      params.done();
    }
  });
};

export const stop = (done) => {
  server.close(done);
};