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

window.TestCase = class TestCase extends RootTestCase{
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // 向上跳，看y座標是否有改變
  async case01() {
    try {
      //action
      await this.judge.press("a", 500);
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case01:", values);
      var condition =
        values[0]["currentCostume"] == 1 && //攻擊造型1
        values[1]["currentCostume"] == 2 && //攻擊造型2
        values[2]["currentCostume"] == 0; //換回造型

      this.callback("case01", condition, "攻擊造型切換");
      sprite["records"] = [];
    } catch (e) {
      this.callback("case01", false, "攻擊造型切換");
    }
  }
};
