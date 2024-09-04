/*
Unit 2-1
評測目標1：賦予角色攻擊的動作(按下指定按鍵進行攻擊，攻擊可以有不同角色造型)

範例操作

https://scratch.mit.edu/projects/979033215

按 A 做出攻擊動作

程式概念
序列
學習重點
準備三種造型：跑步、攻擊 1 及攻擊 2
積木：等待
評量標準
按下 A 鍵，角色造型由跑步⭢攻擊 1⭢攻擊 2⭢跑步，間隔 0.1 秒
*/

window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // 攻擊姿勢變換
  async case01() {
    try {
      await this.judge.press("a", 500);
      var timeline = this.judge.timeline.info();
      var c0 = timeline[0]["update"][2]["currentCostume"];
      var c1 = timeline[1]["update"][2]["currentCostume"];
      var c2 = timeline[2]["update"][2]["currentCostume"];
      var c3 = timeline[3]["update"][2]["currentCostume"];
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
