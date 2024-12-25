import chalk from "chalk";
import fs  from "fs";
import { log } from "console";

const BUF = fs.readFileSync("./roms/Dragon Quest.nes");

// エラーメッセージ
const ERROR = {
  "exist-file-type": "ROM file type does not exist",
};

class ROM {
  constructor(BUF) {
    this.BUF = BUF;
    this.header = {
      "file-type": BUF.subarray(0, 4),
      "rpg-rom": BUF[4],
      "chr-rom": BUF[5],
      "size": 16
    };
    this.check();
  }
  // NES データファイルのチェック
  check() {
    if (this.header["file-type"].toString() !== "\x4E\x45\x53\x1A") {
      throw new Error(ERROR["exist-file-type"]);
    }
  }
  // ROM データのパース
  parse() {
    const chrPage = this.header["chr-rom"],
          chrStart = 0x0010 + this.header["rpg-rom"] * 0x4000,
          chrEnd = chrStart + chrPage * 0x2000;
    return {
      rpgRom: this.BUF.subarray(this.header.size, chrStart - 1),
      chrRom: this.BUF.subarray(chrStart,  chrEnd - 1),
    }
  }
  // デバッグ用 スプライトを表示
  debugViewSprite(chrRom, spriteNum) {
    const sprite = chrRom.subarray(spriteNum * 0x10, spriteNum * 0x10 + 0x10);
    let text = "";
    for (let row = 0; row < 8; row++) {
      const high = sprite[row]; // 上位ビット
      const low = sprite[row + 8]; // 下位ビット
      
      for (let col = 0; col < 8; col++) {
        // 各ピクセルの2ビット値を計算
        const highBit = (high >> (7 - col)) & 1;
        const lowBit = (low >> (7 - col)) & 1;
        const color = (highBit << 1) | lowBit;
        text += this.debugColorPalle(color)("██")
      }
      text += "\n";
    }
    console.log(text);
  }
  debugColorPalle(color) {
    // #FFD8A0 #69C209 #98E800 #676767
    return [chalk.hex("#FFD8A0"), chalk.hex("#69C209"), chalk.hex("#98E800"), chalk.hex("#676767")][color];
  }
 
}


const rom = new ROM(BUF);
const { rpgRom, chrRom } = rom.parse();
// console.log(rpgRom, chrRom);

for (let i = 160; i < 162; i++) {
  rom.debugViewSprite(chrRom, i);
}