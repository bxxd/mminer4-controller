import { BigNumber } from "@ethersproject/bignumber";
import {
  getMineablePunks,
  getOtherPunks,
  getPublicCryptopunksData,
} from "./contracts";
import { getLast72AddressBits, mpunksSolidityKeccak256 } from "./util";
import { assetsToPunkId } from "../assets/assets";

export const checkNonce = async ({
  nonce,
  senderAddr,
}: {
  nonce: BigNumber;
  senderAddr: string;
}): Promise<boolean> => {
  const mineablePunks = getMineablePunks();
  const passesDifficultyTest = await mineablePunks
    .connect(senderAddr)
    .isValidNonce(nonce);

  const lastMinedAssets = await mineablePunks.lastMinedPunkAssets();
  const senderAddrBits = getLast72AddressBits(senderAddr);
  const hash = mpunksSolidityKeccak256(lastMinedAssets, senderAddrBits, nonce);
  console.log("hash: %s", hash._hex);

  if (!passesDifficultyTest) {
    throw new Error(`Nonce ${nonce._hex} does not pass difficulty test`);
    return false;
  }

  const seed = mpunksSolidityKeccak256(lastMinedAssets, senderAddrBits, nonce);
  const otherPunks = getOtherPunks();
  const packedAssets = await otherPunks.seedToPunkAssets(seed);

  const existingPunkId = await mineablePunks.punkAssetsToId(packedAssets);
  if (existingPunkId.gt(BigNumber.from(0))) {
    // console.error(
    //   `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`
    // );
    throw new Error(
      `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`
    );
    return false;
  }

  const publicCryptopunksData = getPublicCryptopunksData();
  const assetNames = await publicCryptopunksData.getPackedAssetNames(
    packedAssets
  );

  const ogCryptopunkId = assetsToPunkId[assetNames];
  if (ogCryptopunkId) {
    console.error(
      `Nonce ${nonce._hex} produces OG CryptoPunk #${ogCryptopunkId}`
    );
    return false;
  }

  return true;
};

export const checkNonceLocal = async ({
  nonce,
  senderAddr,
  difficulty,
}: {
  nonce: BigNumber;
  senderAddr: string;
  difficulty: BigNumber;
}): Promise<boolean> => {
  const mineablePunks = getMineablePunks();

  const lastMinedAssets = await mineablePunks.lastMinedPunkAssets();
  const senderAddrBits = getLast72AddressBits(senderAddr);
  const hash = mpunksSolidityKeccak256(lastMinedAssets, senderAddrBits, nonce);
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
};
