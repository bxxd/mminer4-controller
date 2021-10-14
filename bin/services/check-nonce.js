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
        // throw new Error(`Nonce ${nonce._hex} does not pass difficulty test`);
        // return false;
    }
    else {
        const seed = (0, util_1.mpunksSolidityKeccak256)(lastMinedAssets, senderAddrBits, nonce);
        const otherPunks = (0, contracts_1.getOtherPunks)();
        const packedAssets = yield otherPunks.seedToPunkAssets(seed);
        console.log("packedAssets:", packedAssets);
        const existingPunkId = yield mineablePunks.punkAssetsToId(packedAssets);
        if (existingPunkId.gt(bignumber_1.BigNumber.from(0))) {
            // console.error(
            //   `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`
            // );
            // throw new Error(
            //   `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`
            // );
            // return false;
            error = `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`;
        }
        else {
            const publicCryptopunksData = (0, contracts_1.getPublicCryptopunksData)();
            const assetNames = yield publicCryptopunksData.getPackedAssetNames(packedAssets);
            const ogCryptopunkId = assets_1.assetsToPunkId[assetNames];
            if (ogCryptopunkId) {
                // console.error(
                //   `Nonce ${nonce._hex} produces OG CryptoPunk #${ogCryptopunkId}`
                // );
                error = `Nonce ${nonce._hex} produces OG CryptoPunk #${ogCryptopunkId}`;
                // return false;
            }
        }
    }
    if (error != null) {
        console.log("success");
    }
    if (true) {
        // var api_key = "bd3115342ab0f399f4067c1a77359621-443ec20e-691dc4d5";
        // var domain = "sandbox430ddc20186a4c6585375e6f8604cd28.mailgun.org";
        // var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });
        // var data = {
        //   from: "Excited User <me@samples.mailgun.org>",
        //   to: "bxxd.eth@gmail.com",
        //   subject: ">> NONCE FOUND",
        //   text: "Testing some Mailgun awesomeness!",
        // };
        // if (error != null) {
        //   data.text = `Nonce was found but was error: ${error}`;
        // } else {
        //   data.text = `Nonce found ${nonce._hex} for address ${senderAddr}`;
        // }
        // mailgun.messages().send(data, function (err: any, body: any) {
        //   console.log(err);
        // });
        // data.to = "diwrecktor4582154@gmail.com";
        // mailgun.messages().send(data, function (err: any, body: any) {
        //   console.log(err, body);
        // });
        const accountSid = "ACdbba03391efdaf19c2eddc9c4fe5380e"; // Your Account SID from www.twilio.com/console
        const authToken = "774c7b5c1abf361956149a0f3c950f25"; // Your Auth Token from www.twilio.com/console
        const twilio = require("twilio");
        const client = new twilio(accountSid, authToken);
        if (process.env.SEND_TWILIO == "true") {
            if (error == null) {
                console.log("trying to send nonce found test");
                const msg = `NONCE FOUND ${nonce._hex} address ${senderAddr}`;
                console.log("sending.. ", msg);
                client.messages
                    .create({
                    body: msg,
                    to: "+13476109150",
                    from: "+12183962228", // From a valid Twilio number
                })
                    .then((message) => console.log("sent:", message.sid));
                // client.messages
                //   .create({
                //     body: msg,
                //     to: "+12017367833", // Text this number
                //     from: "+12183962228", // From a valid Twilio number
                //   })
                //   .then((message: any) => console.log("sent:", message.sid));
            }
            else {
                console.log("sending nonce error: ", error);
                client.messages
                    .create({
                    body: error,
                    to: "+13476109150",
                    from: "+12183962228", // From a valid Twilio number
                })
                    .then((message) => console.log("here2:", message.sid));
                // client.messages
                //   .create({
                //     body: error,
                //     to: "+12017367833", // Text this number
                //     from: "+12183962228", // From a valid Twilio number
                //   })
                //   .then((message: any) => console.log("here2:", message.sid));
            }
        }
    }
    if (error != null) {
        console.log(error);
        return false;
        // throw new Error(error);
    }
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