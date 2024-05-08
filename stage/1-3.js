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
    await this.case02();
    await this.case03();
  }

  // 判斷往右移動時，人物姿勢是否會改變
  async case01() {
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var costumeA = sprite.target.currentCostume;
    this.judge.press("ArrowRight", 200);
    await this.judge.delay(50);
    var costumeB = sprite.target.currentCostume;
    await this.judge.delay(200);
    var costumeC = sprite.target.currentCostume;
    this.callback(
      "case01",
      costumeA == costumeC && costumeA != costumeB,
      "判斷人物姿勢改變"
    );
    sprite["records"] = [];
  }

  // 向右移動0.5秒，最後x座標要大於原來的x座標
  async case02() {
    //action
    await this.judge.press("ArrowRight", 500);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    var firstEle = values[0];
    var lastEle = values[values.length - 1];
    var val = lastEle - firstEle;
    this.callback("case02", val > 0, "移動到右側");
    sprite["records"] = [];
  }

  // 向左移動1秒，最後x座標要小於原來的x座標
  async case03() {
    //action
    await this.judge.press("ArrowLeft", 1000);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    var firstEle = values[0];
    var lastEle = values[values.length - 1];
    var val = lastEle + firstEle;
    this.callback("case03", val < 0, "移動到左側");
    sprite["records"] = [];
  }
}

window.TestCase = TestCase;
