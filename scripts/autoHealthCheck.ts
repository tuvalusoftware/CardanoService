import { wallets } from "../core/wallet";
import { fromLovelace } from "../core/utils/converter";
import { fuixlabsProvider } from "../core/fetch";
import { Cron } from "croner";
import { SENDGRID_API_KEY } from "../core/config";
import sgMail from "@sendgrid/mail";
import { ILogObj, Logger } from "tslog";
import { appendFileSync } from "fs";
import { sendAda } from "./sendAda";
sgMail.setApiKey(SENDGRID_API_KEY);

const log: Logger<ILogObj> = new Logger();

log.attachTransport((logObj) => {
  appendFileSync("autoHealthCheck.log", JSON.stringify(logObj) + "\n");
});

function sendMail() {
  const msg = {
    to: "tqkhang@fuixlabs.com",
    from: "quocbao@fuixlabs.com",
    subject: "[CardanoService] Your wallet is running out of ADA",
    text: "Please deposit more ADA to your wallet",
  };

  sgMail
    .send(msg)
    .then((response) => {
      log.info(response[0].statusCode);
      log.info(response[0].headers);
    })
    .catch((error) => {
      log.error(error);
    });
}

async function autoHealthCheck() {
  const numWallets = wallets.length;
  for (let i = 0; i < numWallets; ++i) {
    const wallet = wallets[i];
    const balance = await fuixlabsProvider.getLovelace(
      wallet.getPaymentAddress()
    );
    if (fromLovelace(balance) < 50n) {
      sendMail();
      try {
        await sendAda();
      } catch (e) {
        log.error(e);
      }
      break;
    }
  }
}

// const CronString: string = "0 * * * *"; // Every hour
const CronString: string = "0 0 0 * * 2"; // Every Tuesday at 00:00:00

log.info("Auto health check is running");
const job = new Cron(CronString, async () => {
  log.info("Running a health check every hour");
  await autoHealthCheck();
});

process.on("SIGINT", () => {
  job.stop();
});

process.on("SIGTERM", () => {
  job.stop();
});