interface ICount {
  [details: string]: number;
}

var pings: ICount = {};
var hashrate: number = 0;
export const info_filename: string = "info.json";
export const nonces_filename: string = "nonces.txt";
export const latest_filename: string = "latest.txt";

export var current_address: string;

export function poolInit() {
  current_address =
    process.env.ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS;
  return true;
}

export function dateString() {
  const date = new Date();
  // get the date as a string
  const n = date.toDateString();

  // get the time as a string
  const time = date.toLocaleTimeString();

  return n + " " + time;
}

export async function addNonceMsg(
  nonce: string,
  address: string,
  error: string
) {
  console.log("addNonceMsg..");
  const fs = require("fs");

  let info = {
    address: address,
    error: error,
    success: error == null,
    nonce: nonce,
    ts: dateString(),
  };

  console.log(info);

  let data = JSON.stringify(info, null, 2);
  fs.appendFileSync(nonces_filename, data);

  if (error == null) {
    fs.writeFileSync(latest_filename, data);
  }
}

export function addHashrate(rate: number) {
  console.log("hashrate", hashrate);
  console.log("rate", rate);
  hashrate += rate;
}

export function readInfo() {
  const fs = require("fs");
  if (fs.existsSync(info_filename)) {
    let data = fs.readFileSync(info_filename);

    let info = JSON.parse(data);
    console.log("info", info);
    current_address = info.current;
    pings = info.pings;
  }
}

export async function updateInfo(timeDiff: number) {
  const fs = require("fs");

  let info = {
    current: current_address,
    pings: pings,
    hashrate: Math.floor((hashrate * 30) / (timeDiff * 1000000)) + "MH/s",
    ts: dateString(),
  };
  hashrate = 0;

  console.log("updateInfo..", info);

  let data = JSON.stringify(info, null, 2);
  fs.writeFileSync(info_filename, data);
}

export function setNewCurrentAddress() {
  console.log("setNewCurrentAddress..");
  var max: number = 0;
  var address: string = current_address;
  for (const [key, value] of Object.entries(pings)) {
    if (key.startsWith("0x")) {
      if (value > max) {
        max = value;
        address = key;
      }
    }
  }
  console.log("setting to", address);
  pings[address] = 0;
  current_address = address;
}

var rotation: number = 0;

export function updatePing(senderAddr: string) {
  console.log("updatePing..");

  if (current_address == senderAddr) {
    rotation += 1;
    if (rotation > 5) {
      console.log("skipping ping for current", senderAddr);
      rotation = 0;
      return false;
    }
  }

  if (senderAddr in pings) {
    pings[senderAddr]++;
  } else {
    pings[senderAddr] = 1;
  }

  console.log(pings);

  return true;
}
