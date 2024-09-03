/*
評測目標2：賦予角色防禦的動作(按下指定按鍵進行防禦)
範例操作
https://scratch.mit.edu/projects/979042531
按 D 做出防禦動作
程式概念
序列
學習重點
準備三種造型：跑步、防禦 1 及防禦 2
積木：等待
評量標準
按下 A 鍵，角色造型由跑步⭢防禦 1⭢防禦 2⭢跑步，間隔 0.1 秒
*/

window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // 防禦姿勢變換
  async case01() {
    try {
      await this.judge.press("d", 500);
      var timeline = this.judge.timeline.info();
      var c0 = timeline[0]["Sprite1"][1];
      var c1 = timeline[1]["Sprite1"][1];
      var c2 = timeline[2]["Sprite1"][1];
      var c3 = timeline[3]["Sprite1"][1];
      this.callback(
        "case01",
        c0 == 0 && c1 == 1 && c2 == 2 && c3 == 0,
        "攻擊造型切換"
      );
    } catch (e) {
      this.callback("case01", false, "攻擊造型切換");
    }
  }
};
