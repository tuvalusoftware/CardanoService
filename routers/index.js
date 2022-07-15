import * as R  from "./routes";

const BASE_API = "/api/v2";

export const routers = (app) => {
  app.get("/", (req, res, next) => {
    return res.json({
      code: 0,
      message: "This is Cardano Service API",
      data: null,
    });
  });
  app.use(`${BASE_API}`, R.router);
};