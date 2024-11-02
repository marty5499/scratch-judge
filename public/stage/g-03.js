window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.caseBase("這裡是倫敦!", "computer beep", "case01");
    await this.caseBase("這裡是富士山!", "collect", "case02");
    await this.caseBase("這裡是紐約!", "buzz whir", "case03");
    await this.caseBase("這裡是巴黎!", "okok", "case04");
  }

  async caseBase(sayText, soundName, caseName) {
    await this.judge.delay(250);
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

    await this.judge.delay(250);
    // 假設在測試用例中
    const soundEvents = judge.timeline
      .info()
      .filter((event) => event.eventName === "sound_play");
    console.log("soundEvents:", soundEvents);
    // 找出 soundEvents 中最後一個元素的 soundName
    if (soundEvents.length > 0) {
      const lastSoundName =
        soundEvents[soundEvents.length - 1]["sound"]["soundName"];
      console.log("SoundName:", lastSoundName, soundName);
      this.callback(
        caseName + ":播放音檔 " + lastSoundName,
        lastSoundName == soundName,
        ``
      );
    }

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
    var condition = saidText == sayText && imgUrl_1 == imgUrl_2;
    this.callback(caseName + ":" + sayText, condition, `切換場景`);
  }
};
