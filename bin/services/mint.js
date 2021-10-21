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
exports.mint = void 0;
const contracts_1 = require("./contracts");
const mint = ({ nonce, wallet, }) => __awaiter(void 0, void 0, void 0, function* () {
    const mineablePunks = (0, contracts_1.getMineablePunks)();
    const numMined = yield mineablePunks.numMined();
    const tx = yield mineablePunks.connect(wallet).mint(nonce, 0, {
        gasLimit: (numMined + 1) % 33 === 0 ? 1400000 : 700000,
    });
    console.log(`Submitted mint tx: ${tx.hash}`);
    return tx;
});
exports.mint = mint;
//# sourceMappingURL=mint.js.map