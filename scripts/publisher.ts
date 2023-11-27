import { keccak256 } from "@ethersproject/keccak256";
import { getSender } from "../core";
import { CardanoService } from "../core/config/rabbit";
import { getDateNow } from "../core/utils";

const { sender } = getSender({ service: CardanoService });

sender.sendToQueue(CardanoService, Buffer.from(JSON.stringify({
  data: {
    hash: `${getDateNow()}`,
    type: "document",
  },
  type: "mint-token",
  id: getDateNow(),
})));