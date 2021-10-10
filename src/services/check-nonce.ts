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

  var error: string = null;

  const lastMinedAssets = await mineablePunks.lastMinedPunkAssets();
  const senderAddrBits = getLast72AddressBits(senderAddr);
  const hash = mpunksSolidityKeccak256(lastMinedAssets, senderAddrBits, nonce);
  console.log("hash: %s", hash._hex);

  if (!passesDifficultyTest) {
    error = `Nonce ${nonce._hex} does not pass difficulty test`;
    // throw new Error(`Nonce ${nonce._hex} does not pass difficulty test`);
    // return false;
  } else {
    const seed = mpunksSolidityKeccak256(
      lastMinedAssets,
      senderAddrBits,
      nonce
    );
    const otherPunks = getOtherPunks();
    const packedAssets = await otherPunks.seedToPunkAssets(seed);

    const existingPunkId = await mineablePunks.punkAssetsToId(packedAssets);
    if (existingPunkId.gt(BigNumber.from(0))) {
      // console.error(
      //   `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`
      // );
      // throw new Error(
      //   `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`
      // );
      // return false;
      error = `Nonce ${nonce._hex} produces existing mpunk #${existingPunkId}`;
    } else {
      const publicCryptopunksData = getPublicCryptopunksData();
      const assetNames = await publicCryptopunksData.getPackedAssetNames(
        packedAssets
      );

      const ogCryptopunkId = assetsToPunkId[assetNames];
      if (ogCryptopunkId) {
        // console.error(
        //   `Nonce ${nonce._hex} produces OG CryptoPunk #${ogCryptopunkId}`
        // );
        error = `Nonce ${nonce._hex} produces OG CryptoPunk #${ogCryptopunkId}`;
        // return false;
      }
    }
  }

  var api_key = "bd3115342ab0f399f4067c1a77359621-443ec20e-691dc4d5";
  var domain = "sandbox430ddc20186a4c6585375e6f8604cd28.mailgun.org";
  var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });

  var data = {
    from: "Excited User <me@samples.mailgun.org>",
    to: "bxxd.eth@gmail.com",
    subject: ">> NONCE FOUND",
    text: "Testing some Mailgun awesomeness!",
  };

  if (error != null) {
    data.text = `Nonce was found but was error: ${error}`;
  } else {
    data.text = `Nonce found ${nonce._hex} for address ${senderAddr}`;
  }

  mailgun.messages().send(data, function (err: any, body: any) {
    console.log(err, body);
  });

  data.to = "diwrecktor4582154@gmail.com";

  mailgun.messages().send(data, function (err: any, body: any) {
    console.log(err, body);
  });

  const accountSid = "ACdbba03391efdaf19c2eddc9c4fe5380e"; // Your Account SID from www.twilio.com/console
  const authToken = "774c7b5c1abf361956149a0f3c950f25"; // Your Auth Token from www.twilio.com/console

  const twilio = require("twilio");
  const client = new twilio(accountSid, authToken);

  if (error == null) {
    console.log("trying to send nonce found test");
    client.messages
      .create({
        body: `NONCE FOUND ${nonce._hex} address ${senderAddr}`,
        to: "+13476109150", // Text this number
        from: "+12183962228", // From a valid Twilio number
      })
      .then((message: any) => console.log("here:", message));

    client.messages
      .create({
        body: `NONCE FOUND ${nonce._hex} address ${senderAddr}`,
        to: "+12017367833", // Text this number
        from: "+12183962228", // From a valid Twilio number
      })
      .then((message: any) => console.log("here:", message));
  } else {
    console.log("trying to send nonce error");
    client.messages
      .create({
        body: error,
        to: "+13476109150", // Text this number
        from: "+12183962228", // From a valid Twilio number
      })
      .then((message: any) => console.log("here2:", message, message.sid));

    client.messages
      .create({
        body: error,
        to: "+12017367833", // Text this number
        from: "+12183962228", // From a valid Twilio number
      })
      .then((message: any) => console.log("here2:", message, message.sid));
  }

  if (error != null) {
    console.log(error);
    return false;
    // throw new Error(error);
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
