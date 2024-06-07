window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
    window.frameRate = 3;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    await this.judge.delay(500); // 等待一秒以確保字串顯示
    this.callback("case01", true, `畫圖`);
    console.log(this.judge.sprites);
  }
};
