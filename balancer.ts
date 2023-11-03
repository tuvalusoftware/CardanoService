import express, { Application, Request, Response, Router } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import figlet from "figlet";
import { Logger, ILogObj } from "tslog";
import { BASE_PORT } from "./core/config";

const log: Logger<ILogObj> = new Logger();

const app: Application = express();
const router: Router = express.Router();

app.use(bodyParser.json());
app.use(cookieParser());

const servers: any = [];
for (let port = BASE_PORT; port < BASE_PORT + 5; ++port) {
  servers.push({
    host: "localhost",
    port,
    weight: 1,
  });
}

log.info("Servers", servers);

const proxy: any = {
  target: "",
  changeOrigin: true,
  onProxyReq: (proxyReq: any, req: any) => { },
  onProxyRes: (proxyRes: any, req: any, res: any) => { },
  logLevel: "debug"
};

const getServer = () => {
  return servers[Math.floor(Math.random() * servers.length)];
};

router.all("*", (req, res, next) => {
  const target: any = getServer();
  proxy.target = `http://${target.host}:${target.port}`;
  const apiProxy = createProxyMiddleware(proxy);
  apiProxy(req, res, next);
});

app.use(router);

app.listen(process.env?.PORT || 3030, () => {
  const CardanoServiceBalancer = figlet.textSync("CardanoServiceBalancer");
  console.log(CardanoServiceBalancer);
});