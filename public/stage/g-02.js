window.TestCase = class TestCase extends RootTestCase{
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
    await this.case02();
  }

  async case01() {
    await this.judge.delay(100);
    // 輸入字串到輸入框，並且按下 enter
    this.judge.enterInput(30);
    await this.judge.delay(500); // 等待一秒以確保字串顯示

    let saidText = "";
    for (const target of this.judge.vm.runtime.targets) {
      if (target._customState && target._customState["Scratch.looks"]) {
        saidText = target._customState["Scratch.looks"]["text"];
        if (saidText != "") break;
      }
    }
    this.callback("case01", saidText == "答對了", `送出正確答案`);
  }

  async case02() {
    await this.judge.restart();
    await this.judge.delay(1000);
    // 輸入字串到輸入框，並且按下 enter
    this.judge.enterInput(50);
    await this.judge.delay(500); // 等待一秒以確保字串顯示

    let saidText = "";
    for (const target of this.judge.vm.runtime.targets) {
      if (target._customState && target._customState["Scratch.looks"]) {
        saidText = target._customState["Scratch.looks"]["text"];
        if (saidText != "") break;
      }
    }
    this.callback("case02", saidText == "答錯了", `送出錯誤答案`);
  }
};
