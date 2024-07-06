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
    await this.judge.delay(300);
    var result = await this.captureAndCompare("./stage/draw-01.png");
    //console.log("result.rawMisMatchPercentage:", result);
    this.callback("case01", result.rawMisMatchPercentage < 1, `畫圖`);
  }
};
