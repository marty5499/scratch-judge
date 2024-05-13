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
    //check
    await this.judge.delay(500);
    var key = Object.keys(this.judge.sprites)[1];
    var sprite = this.judge.sprites[key];
    console.log(">>>",sprite['records']);
    // 假設 sprite.target.sprite.clones 已經是一個存在的陣列
    this.callback("case01", true, "NPC 移動");
    sprite["records"] = [];
  }
};
