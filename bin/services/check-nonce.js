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
exports.checkNonceLocal = exports.checkNonce = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const contracts_1 = require("./contracts");
const util_1 = require("./util");
const assets_1 = require("../assets/assets");
const checkNonce = ({ nonce, senderAddr, }) => __awaiter(void 0, void 0, void 0, function* () {
    const mineablePunks = (0, contracts_1.getMineablePunks)();
    const passesDifficultyTest = yield mineablePunks
        .connect(senderAddr)
        .isValidNonce(nonce);
    if (!passesDifficultyTest) {
        console.error(`Nonce ${nonce._hex} does not pass difficulty test`);
        return false;
    }
    const lastMinedAssets = yield mineablePunks.lastMinedPunkAssets();
    const senderAddrBits = (0, util_1.getLast72AddressBits)(senderAddr);
    const seed = (0, util_1.mpunksSolidityKeccak256)(lastMinedAssets, senderAddrBits, nonce);
    const otherPunks = (0, contracts_1.getOtherPunks)();
    const packedAssets = yield otherPunks.seedToPunkAssets(seed);
    const existingPunkId = yield mineablePunks.punkAssetsToId(packedAssets);
    if (existingPunkId.gt(bignumber_1.BigNumber.from(0))) {
        console.error(`Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`);
        return false;
    }
    const publicCryptopunksData = (0, contracts_1.getPublicCryptopunksData)();
    const assetNames = yield publicCryptopunksData.getPackedAssetNames(packedAssets);
    const ogCryptopunkId = assets_1.assetsToPunkId[assetNames];
    if (ogCryptopunkId) {
        console.error(`Nonce ${nonce._hex} produces OG CryptoPunk #${ogCryptopunkId}`);
        return false;
    }
    return true;
});
exports.checkNonce = checkNonce;
const checkNonceLocal = ({ nonce, senderAddr, difficulty }) => __awaiter(void 0, void 0, void 0, function* () {
    const mineablePunks = (0, contracts_1.getMineablePunks)();
    const lastMinedAssets = bignumber_1.BigNumber.from(0); //await mineablePunks.lastMinedPunkAssets();
    const senderAddrBits = (0, util_1.getLast72AddressBits)(senderAddr);
    const hash = (0, util_1.mpunksSolidityKeccak256)(lastMinedAssets, senderAddrBits, nonce);
    console.log("hash: %s", hash._hex);
    // const lastMinedAssets = await mineablePunks.lastMinedPunkAssets();
    // const senderAddrBits = getLast72AddressBits(senderAddr);
    // const combined = mpunksSolidityKeccak256(lastMinedAssets, senderAddrBits, nonce);
    // const passesDifficultyTest = combined < difficulty;
    // if (!passesDifficultyTest) {
    //   console.error(`Nonce ${nonce._hex} does not pass difficulty test`);
    //   return false;
    // }
    return true;
});
exports.checkNonceLocal = checkNonceLocal;
//# sourceMappingURL=check-nonce.js.map