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
exports.sleep = exports.checkIfGasTooHigh = exports.GAS_STATUS = exports.getProvider = exports.getLast72AddressBits = exports.mpunksSolidityKeccak256 = void 0;
const utils_1 = require("ethers/lib/utils");
const providers_1 = require("@ethersproject/providers");
const bignumber_1 = require("@ethersproject/bignumber");
const web3_providers_http_1 = __importDefault(require("web3-providers-http"));
const ethers_1 = require("ethers");
function mpunksSolidityKeccak256(lastMinedAssets, addressBits, nonce) {
    const p = (0, utils_1.solidityPack)(["uint96", "uint72", "uint88"], [lastMinedAssets, addressBits, nonce]);
    console.log(p);
    const h = (0, utils_1.solidityKeccak256)(["uint96", "uint72", "uint88"], [lastMinedAssets, addressBits, nonce]);
    return bignumber_1.BigNumber.from(h);
}
exports.mpunksSolidityKeccak256 = mpunksSolidityKeccak256;
function getLast72AddressBits(addr) {
    const addressBits = bignumber_1.BigNumber.from("0x" + addr.substring(addr.length - 18, addr.length));
    return addressBits;
}
exports.getLast72AddressBits = getLast72AddressBits;
const getProvider = () => {
    const WEB3_HOST = process.env.WEB3_HOST;
    /* @ts-ignore */
    const httpProvider = new web3_providers_http_1.default(WEB3_HOST);
    const provider = new providers_1.Web3Provider(httpProvider);
    return provider;
};
exports.getProvider = getProvider;
var GAS_STATUS;
(function (GAS_STATUS) {
    GAS_STATUS["GAS_TOO_HIGH"] = "GAS_TOO_HIGH";
    GAS_STATUS["GAS_VALID"] = "GAS_VALID";
})(GAS_STATUS = exports.GAS_STATUS || (exports.GAS_STATUS = {}));
const checkIfGasTooHigh = ({ provider, maxGasGwei, }) => __awaiter(void 0, void 0, void 0, function* () {
    const maxGasPriceWei = ethers_1.ethers.utils.parseUnits(maxGasGwei, "gwei");
    const currentGasPrice = yield provider.getGasPrice();
    return currentGasPrice.gt(maxGasPriceWei)
        ? GAS_STATUS.GAS_TOO_HIGH
        : GAS_STATUS.GAS_VALID;
});
exports.checkIfGasTooHigh = checkIfGasTooHigh;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
exports.sleep = sleep;
//# sourceMappingURL=util.js.map