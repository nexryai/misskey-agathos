// nexryaid
// unixtime+整数ノイズ+文字列ノイズ（nexryaiからランダムで並べ替え）
// ex) 1699364743467neryax
import * as crypto from "node:crypto";

const nexryaiArray = ["n","e","x","r","y","a","i"];

function getRandomNexryai() {
    return nexryaiArray.sort(() => Math.random() - 0.5).join("");
}

function getRandInt() {
    const buff = crypto.randomBytes(1);
    return parseInt(buff.toString("hex"), 16);
}

export function genNexryaid(date: Date): string {
    const unixtime = Math.floor(date.getTime() / 1000 );
    const randInt = getRandInt();
    const nexryai = getRandomNexryai();

    if (isNaN(unixtime)) throw "Failed to create nexryaid: Invalid Date";

    return `${unixtime}${randInt}${nexryai}`;
}

