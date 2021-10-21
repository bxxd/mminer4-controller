"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_1 = require("@ethersproject/bignumber");
const wallet_1 = require("@ethersproject/wallet");
const ethers_1 = require("ethers");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
// import { exit } from "process";
const check_nonce_1 = require("./services/check-nonce");
const get_mining_inputs_1 = require("./services/get-mining-inputs");
// import { mint } from "./services/mint";
const util_1 = require("./services/util");
// import { getLast72AddressBits, mpunksSolidityKeccak256 } from "./services/util";
// import { minorDifficulty } from "./services/get-mining-inputs";
const pool_1 = require("./services/pool");
const pool_2 = require("./services/pool");
const pool_3 = require("./services/pool");
const mint_1 = require("./services/mint");
require("dotenv").config({ path: path_1.default.resolve(process.cwd(), ".env.local") });
require("console-stamp")(console, "m-d HH:MM:ss");
const DEFAULT_PORT = "17394";
const app = (0, express_1.default)();
const port = process.env.PORT;
if (port !== DEFAULT_PORT) {
    console.warn(`PORT has been changed from the default of ${DEFAULT_PORT} to`, port);
}
var destructing = false;
process.on("SIGINT", function () {
    console.log("SIGINT.");
    destructing = true;
    server.close();
    process.exit();
});
process.on("SIGTERM", function () {
    console.log("SIGTERM.");
    destructing = true;
    server.close();
    process.exit();
});
const STATUS = {
    success: "success",
    error: "error",
};
function success(payload) {
    return {
        status: STATUS.success,
        payload,
    };
}
function err(payload) {
    console.log("payload", payload);
    return {
        status: STATUS.error,
        payload,
    };
}
function getIP(req) {
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    return ip;
}
app.get("/submit-work", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("/submit-work", req.query);
    try {
        const nonce = bignumber_1.BigNumber.from(req.query.nonce);
        const address = req.query.address;
        const submit_work = {
            address: address,
            nonce: nonce,
            last: req.query.last || "<empty>",
        };
        console.log("/submit-work", getIP(req), submit_work);
        const isFullyValid = yield (0, check_nonce_1.checkNonce)({
            nonce,
            senderAddr: address,
        });
        if (!isFullyValid) {
            throw new Error("Nonce is not valid. Check server logs for info.");
        }
        else if (process.env.MINT_WORK == "true") {
            const provider = (0, util_1.getProvider)();
            const gasStatus = yield (0, util_1.checkIfGasTooHigh)({
                provider,
                maxGasGwei: process.env.MAX_GAS_PRICE_GWEI,
            });
            if (gasStatus == util_1.GAS_STATUS.GAS_TOO_HIGH) {
                console.log(`Nonce is valid, but gas price is higher than configured MAX_GAS_PRICE_GWEI of ${process.env.MAX_GAS_PRICE_GWEI}`);
                res.send(err({ gasStatus }));
            }
            else {
                const wallet = new wallet_1.Wallet(process.env.PRIVATE_KEY, provider);
                const tx = yield (0, mint_1.mint)({ nonce, wallet });
                console.log(`Nonce submission transaction hash: ${tx.hash}`);
                res.send(success({ gasStatus, txHash: tx.hash }));
            }
        }
        res.send(success({}));
    }
    catch (e) {
        res.send(err(e));
        console.log("Error submitting work: ", e);
        next();
    }
}));
app.get("/submit-ping", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const nonce = bignumber_1.BigNumber.from(req.query.nonce);
        const address = req.query.address;
        const isFullyValid = yield (0, check_nonce_1.checkNonceMinor)({
            nonce,
            senderAddr: address,
        });
        console.log("isValid", isFullyValid);
        if (!isFullyValid) {
            throw new Error("Nonce is not valid. Does not pass difficulty.");
        }
        else {
            (0, pool_2.updatePing)(req.query.src);
        }
        res.send(success({}));
    }
    catch (e) {
        res.send(err(e));
        console.log("Error submitting work: ", e);
        next();
    }
}));
app.get("/mining-inputs", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let senderAddress = pool_1.current_address;
        const miningInputs = yield (0, get_mining_inputs_1.getMiningInputs)({ senderAddress });
        console.log(getIP(req), miningInputs);
        res.send(success(miningInputs));
    }
    catch (e) {
        res.send(err(e));
        console.log("Error getting mining inputs: ", e.message);
        next();
    }
}));
var lastUpdate = 0;
app.get("/heartbeat", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const heartbeat = {
            type: "heartbeat",
            hashrate: req.query.hashrate || "<empty>",
        };
        var rate = parseInt(req.query.hashrate);
        (0, pool_3.addHashrate)(rate);
        const now = Math.round(Date.now() / 1000);
        var timeDiff = now - lastUpdate;
        if (lastUpdate == 0) {
            lastUpdate = now;
        }
        else if (timeDiff > 60) {
            (0, pool_2.updateInfo)(timeDiff);
            lastUpdate = now;
        }
        console.log(getIP(req), req.query.src, heartbeat);
        res.send(success({}));
    }
    catch (e) {
        res.send(err(e));
        console.log("Error getting mining inputs: ", e.message);
        next();
    }
}));
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
    "DEFAULT_ETH_MINING_ADDRESS",
];
const REQUIRED_MINT_VARIABLES = ["PRIVATE_KEY"];
const REQUIRED_TWILIO_VARIABLES = [
    "TWILIO_ACCOUNTSID",
    "TWILIO_AUTHTOKEN",
    "TWILIO_FROM",
    "TWILIO_TO_1",
];
const LICENSE_ENV_VARIABLES = [
    "ACCEPT_LICENSE",
    "READ_NOTICE",
    "ACCEPT_MAX_GAS_PRICE_GWEI_VALUE",
];
var server = app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hi There!");
    (0, pool_1.poolInit)();
    if (process.env.STICKINESS && process.env.STICKINESS == "true") {
        (0, pool_2.readInfo)();
    }
    try {
        console.log("Initializing...");
        for (let envVariable of REQUIRED_ENV_VARIABLES) {
            if (process.env[envVariable] === undefined ||
                process.env[envVariable] === null ||
                process.env[envVariable].length === 0) {
                throw new Error(`Required environment variable ${envVariable} is missing from .env.local`);
            }
        }
        if (process.env.SEND_TWILIO && process.env.SEND_TWILIO == "true") {
            for (let envVariable of REQUIRED_TWILIO_VARIABLES) {
                if (process.env[envVariable] === undefined ||
                    process.env[envVariable] === null ||
                    process.env[envVariable].length === 0) {
                    throw new Error(`Required SEND_TWILIO environment variable ${envVariable} is missing from .env.local`);
                }
            }
        }
        if (process.env.MINT_WORK && process.env.MINT_WORK == "true") {
            for (let envVariable of REQUIRED_MINT_VARIABLES) {
                if (process.env[envVariable] === undefined ||
                    process.env[envVariable] === null ||
                    process.env[envVariable].length === 0) {
                    throw new Error(`Required MINT_WORK environment variable ${envVariable} is missing from .env.local`);
                }
            }
        }
        for (let envVariable of LICENSE_ENV_VARIABLES) {
            if (process.env[envVariable] !== "true") {
                throw new Error(`Must read the LICENSE and NOTICE files, as well as inspect the default MAX_GAS_PRICE_GWEI, and IF YOU ACCEPT, set ${LICENSE_ENV_VARIABLES} to "true" in .env.local`);
            }
        }
        if (process.env.MINT_WORK == "true" && process.env.PRIVATE_KEY) {
            console.log("Attempting to fetch wallet balance as a test...");
            const provider = (0, util_1.getProvider)();
            const wallet = new wallet_1.Wallet(process.env.PRIVATE_KEY);
            const weiBalance = yield provider.getBalance(wallet.address);
            const etherBalance = ethers_1.ethers.utils.formatEther(weiBalance);
            console.log(`Balance: ${etherBalance} ETH`);
        }
        console.log(`Server started.`);
    }
    catch (e) {
        console.error(`Failed to start server: ${e}`);
        console.log("Keeping the console up so that you can see the error. Close out of the application whenever...");
        while (!destructing) {
            yield (0, util_1.sleep)(300);
        }
    }
}));
//# sourceMappingURL=index.js.map