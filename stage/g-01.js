window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
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
    this.enterInput(nameList[inputName]);
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

  enterInput(text) {
    const inputElement = document.getElementById("scratchInput");
    if (inputElement) {
      inputElement.value = text;

      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        code: "Enter",
        charCode: 13,
        keyCode: 13,
        which: 13,
      });

      inputElement.dispatchEvent(event);
    }
  }
};
