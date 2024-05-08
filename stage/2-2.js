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

window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // 向上跳，看y座標是否有改變
  async case01() {
    //action
    await this.judge.press("d", 500);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    console.log("value:", values);
    var condition =
      values[0]["currentCostume"] == 1 && //防禦造型1
      values[1]["currentCostume"] == 2 && //防禦造型2
      values[2]["currentCostume"] == 0; //換回造型

    this.callback("case01", condition, "防禦造型切換");
    sprite["records"] = [];
  }
};