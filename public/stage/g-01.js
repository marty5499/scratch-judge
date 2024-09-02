window.TestCase = class TestCase extends RootTestCase{
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    var nameList = ['小明','老黃','joe','john',"zark"]
    await this.judge.delay(100);
    // 輸入字串到輸入框，並且按下 enter
    var inputName = parseInt(Math.random() * nameList.length);
    this.judge.enterInput(nameList[inputName]);
    await this.judge.delay(500); // 等待一秒以確保字串顯示

    let saidText = "";
    for (const target of this.judge.vm.runtime.targets) {
      if (target._customState && target._customState["Scratch.looks"]) {
        saidText = target._customState["Scratch.looks"]["text"];
        if (saidText != "") break;
      }
    }

    this.callback(
      "case01",
      saidText === nameList[inputName] + "你好",
      `打招呼，角色說: ${saidText}`
    );
    // sprite["records"] = [];
  }

};
