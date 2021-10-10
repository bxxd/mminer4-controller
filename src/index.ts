import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { ethers } from "ethers";
import express, { Request, response } from "express";
import path from "path";
import { exit } from "process";
import { checkNonce, checkNonceLocal } from "./services/check-nonce";
import { getMiningInputs } from "./services/get-mining-inputs";
import { mint } from "./services/mint";
import { getProvider, sleep } from "./services/util";
import { getLast72AddressBits, mpunksSolidityKeccak256 } from "./services/util";

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
var config = require(path.resolve(process.cwd(), "config.local.js"));
require("console-stamp")(console, "m-d HH:MM:ss");

const DEFAULT_PORT = "17394";
const app = express();
const port = process.env.PORT;
if (port !== DEFAULT_PORT) {
  console.warn(`PORT has been changed from the default of ${DEFAULT_PORT}.`);
}

process.on("SIGINT", function () {
  console.log("SIGINT.");
  server.close();
  process.exit();
});

process.on("SIGTERM", function () {
  console.log("SIGTERM.");
  server.close();
  process.exit();
});

type SubmitPingQuery = {
  nonce?: string;
  address?: string;
};

type SubmitWorkQuery = {
  nonce?: string;
  address?: string;
  last?: string;
};

const STATUS = {
  success: "success",
  error: "error",
};

function success(payload: any) {
  return {
    status: STATUS.success,
    payload,
  };
}

function err(payload: any) {
  console.log("payload", payload);
  return {
    status: STATUS.error,
    payload,
  };
}

function getIP(req: any) {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  return ip;
}

app.get(
  "/submit-work",
  async (req: Request<any, any, any, SubmitWorkQuery>, res, next) => {
    try {
      // if (!process.env.PRIVATE_KEY) {
      //   throw new Error("PRIVATE_KEY must be set to use this endpoint.");
      // }

      // if (!req.query.nonce) {
      //   throw new Error("Missing nonce query parameter.");
      // }

      // const nonce = BigNumber.from(req.query.nonce);
      // const provider = getProvider();
      // const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

      const nonce = BigNumber.from(req.query.nonce);
      const address = req.query.address;

      const submit_work = {
        address: address,
        nonce: nonce,
        last: req.query.last || "<empty>",
      };
      console.log("/submit-work", getIP(req), submit_work);

      // console.log("/submit-work address: %s nonce: %s", address, req.query.nonce);

      const isFullyValid = await checkNonce({
        nonce,
        senderAddr: address,
      });

      // if (!isFullyValid) {
      //   throw new Error("Nonce is not valid. Check server logs for info.");
      // }

      // const tx = await mint({ nonce, wallet });

      // res.send(success({ txHash: tx.hash }));

      if (!isFullyValid) {
        throw new Error("Nonce is not valid. Check server logs for info.");
      }
      res.send(success({}));
    } catch (e) {
      res.send(err(e));
      console.log("Error submitting work: ", e);
      next();
    }
  }
);

app.get(
  "/submit-ping",
  async (req: Request<any, any, any, SubmitPingQuery>, res, next) => {
    try {
      // if (!process.env.PRIVATE_KEY) {
      //   throw new Error("PRIVATE_KEY must be set to use this endpoint.");
      // }

      if (!req.query.nonce) {
        throw new Error("Missing nonce query parameter.");
      }

      if (!req.query.address) {
        throw new Error("Missing address parameter.");
      }

      const nonce = BigNumber.from(req.query.nonce);
      const address = req.query.address;

      const isFullyValid = await checkNonceLocal({
        nonce,
        senderAddr: address,
        difficulty: BigNumber.from("0x7a2aff56698420"),
      });

      // const nonce = BigNumber.from(req.query.nonce);
      // const provider = getProvider();
      // const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

      // const isFullyValid = await checkNonce({
      //   nonce,
      //   senderAddr: wallet.address,
      // });

      // if (!isFullyValid) {
      //   throw new Error("Nonce is not valid. Check server logs for info.");
      // }

      // const tx = await mint({ nonce, wallet });

      // res.send(success({ txHash: tx.hash }));
      res.send(success({}));
    } catch (e) {
      res.send(err(e));
      console.log("Error submitting work: ", e);
      next();
    }
  }
);

app.get("/mining-inputs", async (req, res, next) => {
  try {
    let senderAddress;
    if (process.env.PRIVATE_KEY) {
      const wallet = new Wallet(process.env.PRIVATE_KEY);
      senderAddress = wallet.address;
    } else if (
      process.env.ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS
    ) {
      senderAddress =
        process.env.ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS;
    } else {
      throw new Error(
        "PRIVATE_KEY or ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS must be set to use this endpoint."
      );
    }

    const miningInputs = await getMiningInputs({ senderAddress });
    console.log(getIP(req), miningInputs);
    res.send(success(miningInputs));
  } catch (e) {
    res.send(err(e));
    console.log("Error getting mining inputs: ", e.message);
    next();
  }
});

type HeartbeatQuery = {
  hashrate?: number;
};

app.get(
  "/heartbeat",
  async (req: Request<any, any, any, HeartbeatQuery>, res, next) => {
    try {
      const heartbeat = {
        type: "heartbeat",
        hashrate: req.query.hashrate || "<empty>",
      };
      console.log(getIP(req), heartbeat);
      res.send(success({}));
    } catch (e) {
      res.send(err(e));
      console.log("Error getting mining inputs: ", e.message);
      next();
    }
  }
);

const REQUIRED_ENV_VARIABLES = [
  "WEB3_HOST",
  "PORT",
  "MINEABLE_PUNKS_ADDR",
  "PUBLIC_CRYPTOPUNKS_DATA_ADDR",
  "OTHERPUNKS_ADDR",
  "MAX_GAS_PRICE_GWEI",
  "ACCEPT_MAX_GAS_PRICE_GWEI_VALUE",
  "ACCEPT_LICENSE",
  "READ_NOTICE",
];

const LICENSE_ENV_VARIABLES = [
  "ACCEPT_LICENSE",
  "READ_NOTICE",
  "ACCEPT_MAX_GAS_PRICE_GWEI_VALUE",
];

var server = app.listen(port, async () => {
  console.log("Hi There!");
  console.log(config);
  try {
    console.log("Initializing...");
    for (let envVariable of REQUIRED_ENV_VARIABLES) {
      if (
        process.env[envVariable] === undefined ||
        process.env[envVariable] === null ||
        process.env[envVariable].length === 0
      ) {
        throw new Error(
          `Required environment variable ${envVariable} is missing from .env.local`
        );
      }
    }

    for (let envVariable of LICENSE_ENV_VARIABLES) {
      if (process.env[envVariable] !== "true") {
        throw new Error(
          `Must read the LICENSE and NOTICE files, as well as inspect the default MAX_GAS_PRICE_GWEI, and IF YOU ACCEPT, set ${LICENSE_ENV_VARIABLES} to "true" in .env.local`
        );
      }
    }

    if (process.env.PRIVATE_KEY) {
      console.log("Attempting to fetch wallet balance as a test...");
      const provider = getProvider();
      const wallet = new Wallet(process.env.PRIVATE_KEY);
      const weiBalance = await provider.getBalance(wallet.address);
      const etherBalance = ethers.utils.formatEther(weiBalance);
      console.log(`Balance: ${etherBalance} ETH`);
    }

    console.log(`Server started.`);
  } catch (e) {
    console.error(`Failed to start server: ${e}`);
    console.log(
      "Keeping the console up so that you can see the error. Close out of the application whenever..."
    );

    while (true) {
      await sleep(300);
    }
  }
});
