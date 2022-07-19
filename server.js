import http from "http";
import express from "express";
import cookieParser from "cookie-parser";

import { routers } from "./routers";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./api-docs";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
    console.log(`Listening on http://localhost${params.port ? `:${params.port}` : ""}`);
    if (params && params.done) {
      params.done();
    }
  });
};

export const stop = (done) => {
  server.close(done);
};