/*
評測目標4：創造角色的動作造型(跳躍、二段跳躍)

範例操作

https://scratch.mit.edu/projects/979020087

按⭡跳躍

程式概念
序列
迴圈
學習重點
準備二種造型：跑步及跳躍
向上跳躍時切換造型
評量標準
按下向上鍵，角色切換成跳躍造型，角色向上移動100後向下移動100，落地後換回跑步造型
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
    await this.judge.press("ArrowUp", 500);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    console.log("value:", values);
    var condition =
      values[9]["y"] == 100 && //跳到最高處
      values[0]["currentCostume"] == 1 && //換跳耀造型
      values[20]["currentCostume"] == 0; //換回造型

    this.callback("case01", condition, "跳一跳");
    sprite["records"] = [];
  }
};