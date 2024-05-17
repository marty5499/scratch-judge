window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
    setFrameRate(3);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() { 
    var sprite1 = this.judge.sprites[Object.keys(this.judge.sprites)[2]];
    var sprite2 = this.judge.sprites[Object.keys(this.judge.sprites)[2]];
    await this.judge.delay(150);
    this.judge.press("ArrowUp", 200);
    await this.judge.press(" ", 10);
    await this.judge.delay(300);
    console.log("sprite1:", this.judge.sprites);
    console.log("sprite1:", sprite1);
    this.callback("case01", true, "主角攻擊敵人");
    //sprite1["records"] = [];
    //sprite2["records"] = [];
  }
};
