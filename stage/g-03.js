window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    console.log("start..");
    await this.judge.delay(500);
    console.log("Scan");
    //*/ 獲取需要點擊的 sprite 位置
    for (const target of this.judge.vm.runtime.targets) {
      if (target.sprite.name === "Robot") {
        window.tt = target;
        console.log("click:", target);
        await this.judge.clickSprite(target);
      }
    }

    await this.judge.delay(500); // 等待場景切換
    let saidText = "";
    for (const target of this.judge.vm.runtime.targets) {
      if (target.sprite.name === "Robot") {
        saidText = target._customState["Scratch.looks"]["text"];
      }
    }
    console.log("saidText:", saidText);
    this.callback("case01", true, `切換場景`);
  }
};
