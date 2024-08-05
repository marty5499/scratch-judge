window.TestCase = class TestCase extends DrawTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
  }

  // sb3 檔案執行結束,再進行判斷
  async onCompleted(ansPNG) {
    var result = await this.captureAndCompare(ansPNG);
    //console.log("result.rawMisMatchPercentage:", result);
    this.callback("", result.rawMisMatchPercentage < 1, `畫圖`);
  }
};
