window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // 檢測 x 座標是否在正負200範圍內依序變化
  async case01() {
    const startTime = Date.now();
    await this.judge.delay(1500);
    var key = Object.keys(this.judge.sprites)[1];
    var sprite = this.judge.sprites[key];
    const endTime = Date.now();
    const records = sprite["records"].filter(
      (record) => record.timestamp >= startTime && record.timestamp <= endTime
    );
    console.log("case01:", records);
    let isSequential = true;
    for (let i = 1; i < records.length; i++) {
      const prevX = records[i - 1].x;
      const currX = records[i].x;
      if (Math.abs(currX - prevX) > 200) {
        console.log(currX, prevX, currX - prevX);
        isSequential = false;
        break;
      }
    }
    const costumeChanges =
      new Set(records.map((record) => record.currentCostume)).size > 1;
    this.callback("case01", isSequential && costumeChanges, "NPC 移動");
    sprite["records"] = [];
  }
};
