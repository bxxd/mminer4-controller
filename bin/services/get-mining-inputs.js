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
exports.getMiningInputs = void 0;
const contracts_1 = require("./contracts");
const util_1 = require("./util");
var lastMined = null;
var lastDifficulty = null;
var lastGet = null;
const getMiningInputs = ({ senderAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    const mineablePunks = (0, contracts_1.getMineablePunks)();
    const now = Math.round(Date.now() / 1000);
    var lastMinedAssets = lastMined;
    var difficultyTarget = lastDifficulty;
    if (lastGet != null) {
        console.log(now - lastGet);
    }
    if (lastGet == null || now - lastGet > 60) {
        console.log("setting new mining inputs values");
        lastMinedAssets = (yield mineablePunks.lastMinedPunkAssets())._hex;
        difficultyTarget = (yield mineablePunks.difficultyTarget())._hex;
        lastMined = lastMinedAssets;
        lastDifficulty = difficultyTarget;
        lastGet = Math.round(Date.now() / 1000);
    }
    const senderAddressBits = (0, util_1.getLast72AddressBits)(senderAddress)._hex;
    const minorDifficulty = "0x7a2aff56698420";
    return {
        lastMinedAssets,
        senderAddressBits,
        senderAddress,
        difficultyTarget,
        minorDifficulty,
    };
});
exports.getMiningInputs = getMiningInputs;
//# sourceMappingURL=get-mining-inputs.js.map