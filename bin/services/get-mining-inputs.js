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
const getMiningInputs = ({ senderAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    const mineablePunks = (0, contracts_1.getMineablePunks)();
    const lastMinedAssets = (yield mineablePunks.lastMinedPunkAssets())._hex;
    const difficultyTarget = (yield mineablePunks.difficultyTarget())._hex;
    const senderAddressBits = (0, util_1.getLast72AddressBits)(senderAddress)._hex;
    const minorDifficulty = "0x7a2aff56698420";
    return {
        lastMinedAssets,
        senderAddressBits,
        senderAddress,
        difficultyTarget,
        minorDifficulty
    };
});
exports.getMiningInputs = getMiningInputs;
//# sourceMappingURL=get-mining-inputs.js.map