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
const check_nonce_1 = require("./services/check-nonce");
const get_mining_inputs_1 = require("./services/get-mining-inputs");
const util_1 = require("./services/util");
require("dotenv").config({ path: path_1.default.resolve(process.cwd(), ".env.local") });
const DEFAULT_PORT = "17394";
const app = (0, express_1.default)();
const port = process.env.PORT;
if (port !== DEFAULT_PORT) {
    console.warn(`PORT has been changed from the default of ${DEFAULT_PORT}.`);
}
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
    return {
        status: STATUS.error,
        payload,
    };
}
app.get("/submit-work", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const nonce = bignumber_1.BigNumber.from(req.query.nonce);
        const address = req.query.address;
        console.log("/submit-work address: %s nonce: %s", address, req.query.nonce);
        const isFullyValid = yield (0, check_nonce_1.checkNonce)({
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
    }
    catch (e) {
        res.send(err(e));
        console.log("Error submitting work: ", e);
        next();
    }
}));
app.get("/submit-ping", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const nonce = bignumber_1.BigNumber.from(req.query.nonce);
        const address = req.query.address;
        const isFullyValid = yield (0, check_nonce_1.checkNonceLocal)({
            nonce,
            senderAddr: address,
            difficulty: bignumber_1.BigNumber.from("0x7a2aff56698420")
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
    }
    catch (e) {
        res.send(err(e));
        console.log("Error submitting work: ", e);
        next();
    }
}));
app.get("/mining-inputs", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let senderAddress;
        if (process.env.PRIVATE_KEY) {
            const wallet = new wallet_1.Wallet(process.env.PRIVATE_KEY);
            senderAddress = wallet.address;
        }
        else if (process.env.ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS) {
            senderAddress =
                process.env.ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS;
        }
        else {
            throw new Error("PRIVATE_KEY or ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS must be set to use this endpoint.");
        }
        const miningInputs = yield (0, get_mining_inputs_1.getMiningInputs)({ senderAddress });
        res.send(success(miningInputs));
    }
    catch (e) {
        res.send(err(e));
        console.log("Error getting mining inputs: ", e.message);
        next();
    }
}));
app.get("/heartbeat", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const heartbeat = {
            type: "heartbeat",
            hashrate: req.query.hashrate || "<empty>",
        };
        console.log(heartbeat);
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
];
const LICENSE_ENV_VARIABLES = ["ACCEPT_LICENSE", "READ_NOTICE", "ACCEPT_MAX_GAS_PRICE_GWEI_VALUE"];
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Initializing...");
        for (let envVariable of REQUIRED_ENV_VARIABLES) {
            if (process.env[envVariable] === undefined ||
                process.env[envVariable] === null ||
                process.env[envVariable].length === 0) {
                throw new Error(`Required environment variable ${envVariable} is missing from .env.local`);
            }
        }
        for (let envVariable of LICENSE_ENV_VARIABLES) {
            if (process.env[envVariable] !== "true") {
                throw new Error(`Must read the LICENSE and NOTICE files, as well as inspect the default MAX_GAS_PRICE_GWEI, and IF YOU ACCEPT, set ${LICENSE_ENV_VARIABLES} to "true" in .env.local`);
            }
        }
        if (process.env.PRIVATE_KEY) {
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
        while (true) {
            yield (0, util_1.sleep)(300);
        }
    }
}));
//# sourceMappingURL=index.js.map