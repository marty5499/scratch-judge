window.TestCase = class TestCase extends DrawTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
  }

  // sb3 檔案執行結束,再進行判斷
  async onCompleted(ansPNG) {
    // await this.saveImage(); // 儲存圖片
    var result = await this.captureAndCompare(ansPNG);
    this.callback("", result.rawMisMatchPercentage < 1, `畫圖`);
  }
};
