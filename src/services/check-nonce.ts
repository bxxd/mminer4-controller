import { BigNumber } from "@ethersproject/bignumber";
import { lastMined, minorDifficulty } from "./get-mining-inputs";
import {
  getMineablePunks,
  getOtherPunks,
  getPublicCryptopunksData,
} from "./contracts";
import { getLast72AddressBits, mpunksSolidityKeccak256 } from "./util";
import { assetsToPunkId } from "../assets/assets";
import { addNonceMsg, setNewCurrentAddress } from "./pool";

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

  var error: string = null;

  const lastMinedAssets = await mineablePunks.lastMinedPunkAssets();
  const senderAddrBits = getLast72AddressBits(senderAddr);
  const hash = mpunksSolidityKeccak256(lastMinedAssets, senderAddrBits, nonce);
  console.log("hash: %s", hash._hex);

  if (!passesDifficultyTest) {
    error = `Nonce ${nonce._hex} does not pass difficulty test`;
  } else {
    const seed = mpunksSolidityKeccak256(
      lastMinedAssets,
      senderAddrBits,
      nonce
    );
    const otherPunks = getOtherPunks();
    const packedAssets = await otherPunks.seedToPunkAssets(seed);
    console.log("packedAssets:", packedAssets);
    const existingPunkId = await mineablePunks.punkAssetsToId(packedAssets);
    var assetNames = "";

    if (existingPunkId.gt(BigNumber.from(0))) {
      error = `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`;
    } else {
      const publicCryptopunksData = getPublicCryptopunksData();
      assetNames = await publicCryptopunksData.getPackedAssetNames(
        packedAssets
      );

      const ogCryptopunkId = assetsToPunkId[assetNames];
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
            to: process.env.TWILIO_TO_1, // Text this number
            from: process.env.TWILIO_FROM, // From a valid Twilio number
          })
          .then((message: any) => console.log("sent:", message.sid));
      }

      if (process.env.TWILIO_TO_2) {
        client.messages
          .create({
            body: msg,
            to: process.env.TWILIO_TO_2, // Text this number
            from: process.env.TWILIO_FROM, // From a valid Twilio number
          })
          .then((message: any) => console.log("sent:", message.sid));
      }
    } else {
      console.log("sending nonce error: ", error);

      if (process.env.TWILIO_TO_1) {
        client.messages
          .create({
            body: error,
            to: process.env.TWILIO_TO_1, // Text this number
            from: process.env.TWILIO_FROM, // From a valid Twilio number
          })
          .then((message: any) => console.log("sent2:", message.sid));
      }

      if (process.env.TWILIO_TO_2) {
        client.messages
          .create({
            body: error,
            to: process.env.TWILIO_TO_2, // Text this number
            from: process.env.TWILIO_FROM, // From a valid Twilio number
          })
          .then((message: any) => console.log("sent2:", message.sid));
      }
    }
  }

  addNonceMsg(nonce._hex, senderAddr, error, assetNames);

  if (error != null) {
    console.log(error);
    return false;
    // throw new Error(error);
  }

  setNewCurrentAddress();

  return true;
};

export const checkNonceMinor = async ({
  nonce,
  senderAddr,
}: {
  nonce: BigNumber;
  senderAddr: string;
}): Promise<boolean> => {
  const lastMinedAssets = BigNumber.from(lastMined);
  const senderAddrBits = getLast72AddressBits(senderAddr);
  const hash = mpunksSolidityKeccak256(lastMinedAssets, senderAddrBits, nonce);
  const minor = BigNumber.from(minorDifficulty);
  const hashbits = getLast72AddressBits(hash.toHexString());
  const compressed = BigNumber.from(hashbits);
  console.log(
    "hash: %s minor: %s hashbits %s",
    hash._hex,
    minor._hex,
    compressed._hex
  );
  return compressed.lt(minor);
};
