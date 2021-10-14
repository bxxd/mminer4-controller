import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { ethers } from "ethers";
import express, { Request, response } from "express";
import path from "path";
import { exit } from "process";
import { checkNonce, checkNonceMinor } from "./services/check-nonce";
import { getMiningInputs } from "./services/get-mining-inputs";
import { mint } from "./services/mint";
import { getProvider, sleep } from "./services/util";
import { getLast72AddressBits, mpunksSolidityKeccak256 } from "./services/util";
import { minorDifficulty } from "./services/get-mining-inputs";
import { current_address, poolInit } from "./services/pool";
import { updatePing, readInfo } from "./services/pool";
import { addHashrate } from "./services/pool";

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
var config = require(path.resolve(process.cwd(), "config.local.js"));
require("console-stamp")(console, "m-d HH:MM:ss");

const DEFAULT_PORT = "17394";
const app = express();
const port = process.env.PORT;
if (port !== DEFAULT_PORT) {
  console.warn(
    `PORT has been changed from the default of ${DEFAULT_PORT} to`,
    port
  );
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
  src?: string;
  last?: string;
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
    console.log("/submit-work", req.query);
    try {
      const nonce = BigNumber.from(req.query.nonce);
      const address = req.query.address;

      const submit_work = {
        address: address,
        nonce: nonce,
        last: req.query.last || "<empty>",
      };
      console.log("/submit-work", getIP(req), submit_work);

      const isFullyValid = await checkNonce({
        nonce,
        senderAddr: address,
      });

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
    console.log("/submit-ping", req.query);
    try {
      if (!req.query.nonce) {
        throw new Error("Missing nonce query parameter.");
      }

      if (!req.query.address) {
        throw new Error("Missing address parameter.");
      }

      if (!req.query.src) {
        throw new Error("Missing src address parameter.");
      }

      const nonce = BigNumber.from(req.query.nonce);
      const address = req.query.src;

      const isFullyValid = await checkNonceMinor({
        nonce,
        senderAddr: address,
      });

      console.log("isValid", isFullyValid);

      if (!isFullyValid) {
        throw new Error("Nonce is not valid. Does not pass difficulty.");
      } else {
        updatePing(address);
      }

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
    let senderAddress = current_address;

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
  hashrate?: string;
};

app.get(
  "/heartbeat",
  async (req: Request<any, any, any, HeartbeatQuery>, res, next) => {
    try {
      const heartbeat = {
        type: "heartbeat",
        hashrate: req.query.hashrate || "<empty>",
      };
      var rate: number = parseInt(req.query.hashrate);
      addHashrate(rate);
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
  poolInit();
  readInfo();
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
