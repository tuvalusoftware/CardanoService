import express, { Application, Request, Response, Router } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import figlet from "figlet";
import { Logger, ILogObj } from "tslog";

const app: Application = express();
const router: Router = express.Router();

app.use(bodyParser.json());
app.use(cookieParser());

const servers: any = [];
for (let port = 3050; port <= 3054; port += 1) {
  servers.push({
    host: "localhost",
    port,
    weight: 1,
  });
}

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

const log: Logger<ILogObj> = new Logger();

app.listen(3030, () => {
  const CardanoServiceBalancer = figlet.textSync("CardanoServiceBalancer");
  console.log(CardanoServiceBalancer);
});