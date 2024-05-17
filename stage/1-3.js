/*
Unit 1-3
評測目標3：賦予角色基本移動參數(跳躍、二段跳躍)

範例操作
https://scratch.mit.edu/projects/975854235

按⭡跳躍

程式概念
序列
迴圈
學習重點
重覆固定次數
舞台 x, y 軸
積木：y 改變
評量標準
按下向上鍵，角色向上移動100後向下移動100
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
    console.log("case01:", values);
    var result = values[9]["y"] == 100 && values[values.length - 1]["y"] == 0;
    this.callback("case01", result, "跳起來");
    sprite["records"] = [];
  }
};
