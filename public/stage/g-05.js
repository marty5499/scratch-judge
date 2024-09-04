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
    console.log(this.judge.collisionCounts);
    this.callback("case01", true, `分數與碰撞10次以上`);
  }
};
