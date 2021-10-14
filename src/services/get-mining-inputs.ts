import { getMineablePunks } from "./contracts";
import { getLast72AddressBits } from "./util";
import { updateInfo } from "./pool";

export type MiningInputs = {
  lastMinedAssets: string;
  senderAddressBits: string;
  senderAddress: string;
  difficultyTarget: string;
  minorDifficulty: string;
};
export const minorDifficulty = "0x8a2aff56698420";
export var lastMined: string = null;
var lastDifficulty: string = null;
var lastGet: number = null;

export const getMiningInputs = async ({
  senderAddress,
}: {
  senderAddress: string;
}): Promise<MiningInputs> => {
  const mineablePunks = getMineablePunks();
  const now = Math.round(Date.now() / 1000);
  var lastMinedAssets = lastMined;
  var difficultyTarget = lastDifficulty;
  if (lastGet != null) {
    console.log(now - lastGet);
  }
  var timeDiff = now - lastGet;
  if (lastGet == null || timeDiff > 300) {
    lastGet = Math.round(Date.now() / 1000);
    console.log("setting new mining inputs values");
    lastMinedAssets = (await mineablePunks.lastMinedPunkAssets())._hex;
    difficultyTarget = (await mineablePunks.difficultyTarget())._hex;
    lastMined = lastMinedAssets;
    lastDifficulty = difficultyTarget;
    lastGet = Math.round(Date.now() / 1000);
    updateInfo(timeDiff);
  }

  const senderAddressBits = getLast72AddressBits(senderAddress)._hex;

  return {
    lastMinedAssets,
    senderAddressBits,
    senderAddress,
    difficultyTarget,
    minorDifficulty,
  };
};
