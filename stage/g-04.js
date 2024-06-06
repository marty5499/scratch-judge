window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    await this.judge.delay(2000);
    var condition = this.judge.variables["愛心"]['records'].length >= 3;
    this.callback("case01", condition, `分數變動三次以上` );
  }
};
