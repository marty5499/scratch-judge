window.TestCase = class TestCase extends RootTestCase{
  constructor(judge) {
    super(judge);
    //setFrameRate(2);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    await this.judge.delay(5000);
    var condition1 = this.judge.variables["愛心"]["records"].length >= 10;
    var condition2 = this.judge.collisionCounts["Robot"] >= 10;
    this.callback("case01", condition1 && condition2, `分數與碰撞10次以上`);
  }
};
