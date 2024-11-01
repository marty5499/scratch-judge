window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.caseBase("這裡是倫敦!", "case01");
    await this.caseBase("這裡是富士山!", "case02");
    await this.caseBase("這裡是紐約!", "case03");
    await this.caseBase("這裡是巴黎!", "case04");
  }

  async caseBase(sayText, caseName) {
    await this.judge.delay(500);
    var target_stage = null;
    //*/ 獲取需要點擊的 sprite 位置
    for (const target of this.judge.vm.runtime.targets) {
      if (target.sprite.name === "Robot") {
        await this.judge.clickSprite(target);
        console.log("click robot...");
      }
      if (target.sprite.name === "Stage") {
        target_stage = target;
      }
    }
    
    // 假設在測試用例中
    const soundEvents = judge.timeline
      .info()
      .filter((event) => event.eventName === "sound_play");
    console.log(soundEvents);

    var costume = target_stage.sprite.costumes[target_stage.currentCostume];
    var imgUrl_1 = costume.asset.encodeDataURI();
    await this.judge.delay(500); // 等待場景切換
    var costume = target_stage.sprite.costumes[target_stage.currentCostume];
    var imgUrl_2 = costume.asset.encodeDataURI();
    let saidText = "";
    for (const target of this.judge.vm.runtime.targets) {
      if (target.sprite.name === "Robot") {
        saidText = target._customState["Scratch.looks"]["text"];
      }
    }

    var condition = saidText == sayText && imgUrl_1 != imgUrl_2;
    this.callback(caseName + ":" + sayText, condition, `切換場景`);
  }
};
