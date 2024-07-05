window.TestCase = class TestCase extends DrawTestCase {
  constructor(judge) {
    super(judge);
    this.judge = judge;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    var self = this;
    await this.judge.delay(1500);
    await this.captureRenderArea("./stage_draw/達克_函數.png", function (result) {
      console.log("result.rawMisMatchPercentage:", result);
      self.callback("case01", result.rawMisMatchPercentage == 0, `畫圖`);
    });
  }
};
