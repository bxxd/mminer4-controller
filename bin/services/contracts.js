"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOtherPunks = exports.getPublicCryptopunksData = exports.getMineablePunks = void 0;
const otherpunks_1 = require("../contracts/otherpunks");
const mineablepunks_1 = require("../contracts/mineablepunks");
const public_cryptopunks_data_1 = require("../contracts/public-cryptopunks-data");
const util_1 = require("./util");
const getMineablePunks = () => {
    const provider = (0, util_1.getProvider)();
    const address = process.env.MINEABLE_PUNKS_ADDR;
    const contract = mineablepunks_1.Mineablepunks__factory.connect(address, provider);
    return contract;
};
exports.getMineablePunks = getMineablePunks;
const getPublicCryptopunksData = () => {
    const provider = (0, util_1.getProvider)();
    const address = process.env.PUBLIC_CRYPTOPUNKS_DATA_ADDR;
    const contract = public_cryptopunks_data_1.PublicCryptopunksData__factory.connect(address, provider);
    return contract;
};
exports.getPublicCryptopunksData = getPublicCryptopunksData;
const getOtherPunks = () => {
    const provider = (0, util_1.getProvider)();
    const address = process.env.OTHERPUNKS_ADDR;
    const contract = otherpunks_1.Otherpunks__factory.connect(address, provider);
    return contract;
};
exports.getOtherPunks = getOtherPunks;
//# sourceMappingURL=contracts.js.map