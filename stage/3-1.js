window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // 向右移動0.5秒，最後x座標要大於原來的x座標
  async case01() {
    const startTime = Date.now();
    await this.judge.delay(500);
    var key = Object.keys(this.judge.sprites)[1];
    var sprite = this.judge.sprites[key];
    const endTime = Date.now();
    const records = sprite['records'].filter(record => record.timestamp >= startTime && record.timestamp <= endTime);

    if (records.length > 0) {
      const startX = records[0].x;
      const maxX = Math.max(...records.map(record => record.x));
      console.log(">>>", sprite['records']);
      this.callback("case01", maxX > startX, "NPC 移動");
    } else {
      console.log("No records found within the time range");
      this.callback("case01", false, "NPC 移動");
    }
    
    sprite["records"] = [];
  }
};
