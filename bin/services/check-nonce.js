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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNonceMinor = exports.checkNonce = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const get_mining_inputs_1 = require("./get-mining-inputs");
const contracts_1 = require("./contracts");
const util_1 = require("./util");
const assets_1 = require("../assets/assets");
const pool_1 = require("./pool");
const checkNonce = ({ nonce, senderAddr, }) => __awaiter(void 0, void 0, void 0, function* () {
    const mineablePunks = (0, contracts_1.getMineablePunks)();
    const passesDifficultyTest = yield mineablePunks
        .connect(senderAddr)
        .isValidNonce(nonce);
    var error = null;
    const lastMinedAssets = yield mineablePunks.lastMinedPunkAssets();
    const senderAddrBits = (0, util_1.getLast72AddressBits)(senderAddr);
    const hash = (0, util_1.mpunksSolidityKeccak256)(lastMinedAssets, senderAddrBits, nonce);
    console.log("hash: %s", hash._hex);
    if (!passesDifficultyTest) {
        error = `Nonce ${nonce._hex} does not pass difficulty test`;
    }
    else {
        const seed = (0, util_1.mpunksSolidityKeccak256)(lastMinedAssets, senderAddrBits, nonce);
        const otherPunks = (0, contracts_1.getOtherPunks)();
        const packedAssets = yield otherPunks.seedToPunkAssets(seed);
        console.log("packedAssets:", packedAssets);
        const existingPunkId = yield mineablePunks.punkAssetsToId(packedAssets);
        if (existingPunkId.gt(bignumber_1.BigNumber.from(0))) {
            error = `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`;
        }
        else {
            const publicCryptopunksData = (0, contracts_1.getPublicCryptopunksData)();
            const assetNames = yield publicCryptopunksData.getPackedAssetNames(packedAssets);
            const ogCryptopunkId = assets_1.assetsToPunkId[assetNames];
            if (ogCryptopunkId) {
                error = `Nonce ${nonce._hex} produces OG CryptoPunk #${ogCryptopunkId}`;
            }
        }
    }
    if (process.env.SEND_TWILIO == "true") {
        const accountSid = process.env.TWILIO_ACCOUNTSID; // Your Account SID from www.twilio.com/console
        const authToken = process.env.TWILIO_AUTHTOKEN; // Your Auth Token from www.twilio.com/console
        const twilio = require("twilio");
        const client = new twilio(accountSid, authToken);
        if (error == null) {
            console.log("trying to send nonce found test");
            const msg = `NONCE FOUND ${nonce._hex} address ${senderAddr}`;
            console.log("sending.. ", msg);
            if (process.env.TWILIO_TO_1) {
                client.messages
                    .create({
                    body: msg,
                    to: process.env.TWILIO_TO_1,
                    from: process.env.TWILIO_FROM, // From a valid Twilio number
                })
                    .then((message) => console.log("sent:", message.sid));
            }
            if (process.env.TWILIO_TO_2) {
                client.messages
                    .create({
                    body: msg,
                    to: process.env.TWILIO_TO_2,
                    from: process.env.TWILIO_FROM, // From a valid Twilio number
                })
                    .then((message) => console.log("sent:", message.sid));
            }
        }
        else {
            console.log("sending nonce error: ", error);
            if (process.env.TWILIO_TO_1) {
                client.messages
                    .create({
                    body: error,
                    to: process.env.TWILIO_TO_1,
                    from: process.env.TWILIO_FROM, // From a valid Twilio number
                })
                    .then((message) => console.log("sent2:", message.sid));
            }
            if (process.env.TWILIO_TO_2) {
                client.messages
                    .create({
                    body: error,
                    to: process.env.TWILIO_TO_2,
                    from: process.env.TWILIO_FROM, // From a valid Twilio number
                })
                    .then((message) => console.log("sent2:", message.sid));
            }
        }
    }
    (0, pool_1.addNonceMsg)(nonce._hex, senderAddr, error);
    if (error != null) {
        console.log(error);
        return false;
        // throw new Error(error);
    }
    (0, pool_1.setNewCurrentAddress)();
    return true;
});
exports.checkNonce = checkNonce;
const checkNonceMinor = ({ nonce, senderAddr, }) => __awaiter(void 0, void 0, void 0, function* () {
    const lastMinedAssets = bignumber_1.BigNumber.from(get_mining_inputs_1.lastMined);
    const senderAddrBits = (0, util_1.getLast72AddressBits)(senderAddr);
    const hash = (0, util_1.mpunksSolidityKeccak256)(lastMinedAssets, senderAddrBits, nonce);
    const minor = bignumber_1.BigNumber.from(get_mining_inputs_1.minorDifficulty);
    const hashbits = (0, util_1.getLast72AddressBits)(hash.toHexString());
    const compressed = bignumber_1.BigNumber.from(hashbits);
    console.log("hash: %s minor: %s hashbits %s", hash._hex, minor._hex, compressed._hex);
    return compressed.lt(minor);
});
exports.checkNonceMinor = checkNonceMinor;
//# sourceMappingURL=check-nonce.js.map