window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.caseBase("這裡是倫敦!", "computer beep", "message1", "case01");
    await this.caseBase("這裡是富士山!", "collect", "message1", "case02");
    await this.caseBase("這裡是紐約!", "buzz whir", "message1", "case03");
    await this.caseBase("這裡是巴黎!", "okok", "message1", "case04");
  }

  async caseBase(sayText, soundName, expectedBroadcast, caseName) {
    await this.judge.restart(); // 重置引擎
    await this.judge.delay(250);
    var target_stage = null;

    // 獲取需要點擊的 sprite 位置
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

    // 檢查音效播放事件
    const soundEvents = this.judge.timeline
      .info()
      .filter((event) => event.eventName === "sound_play");
    console.log("soundEvents:", soundEvents);

    if (soundEvents.length > 0) {
      const lastSoundName = soundEvents[0]["sound"]["soundName"];
      console.log("SoundName:", lastSoundName, soundName);
      this.callback(
        caseName + ":播放音檔 " + lastSoundName,
        lastSoundName == soundName,
        ``
      );
    }

    // 檢查廣播事件
    const broadcastEvents = this.judge.timeline
      .info()
      .filter((event) => event.eventName === "broadcast");
    console.log("broadcastEvents:", broadcastEvents);

    if (broadcastEvents.length > 0) {
      const lastBroadcastMessage = broadcastEvents[0]["message"];
      console.log(
        "Broadcast Message:",
        lastBroadcastMessage,
        expectedBroadcast
      );
      this.callback(
        caseName + ":廣播訊息 " + lastBroadcastMessage,
        lastBroadcastMessage == expectedBroadcast,
        ``
      );
    }

    var costume = target_stage.sprite.costumes[target_stage.currentCostume];
    var imgUrl_1 = costume.asset.encodeDataURI();
    await this.judge.delay(500); // 等待場景切換
    costume = target_stage.sprite.costumes[target_stage.currentCostume];
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
