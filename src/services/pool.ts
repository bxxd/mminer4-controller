interface ICount {
  [details: string]: number;
}

var pings: ICount = {};
var hashrate: number = 0;
export var current_address: string;

export function poolInit() {
  current_address =
    process.env.ONLY_NEEDED_IF_NOT_INCLUDING_PRIVATE_KEY_WALLET_ADDRESS;
  return true;
}

export function addHashrate(rate: number) {
  console.log("hashrate", hashrate);
  console.log("rate", rate);
  hashrate += rate;
}

export function readInfo() {
  const fs = require("fs");
  if (fs.existsSync("info.json")) {
    let data = fs.readFileSync("info.json");

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
  };
  hashrate = 0;

  console.log("updateInfo..", info);

  let data = JSON.stringify(info, null, 2);
  fs.writeFileSync("info.json", data);
}

export function updatePing(senderAddr: string) {
  console.log("updatePing..");
  if (senderAddr in pings) {
    pings[senderAddr]++;
  } else {
    pings[senderAddr] = 1;
  }

  console.log(pings);

  return true;
}
