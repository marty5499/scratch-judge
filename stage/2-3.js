/*
評測目標3：賦予角色移動時攻擊或防禦的功能

範例操作

https://scratch.mit.edu/projects/979037327

按⭢向右移動
按⭠向左移動
按⭡跳躍
按 A 攻擊

程式概念
序列
迴圈
學習重點
迴轉方式設為左右
積木：面朝
積木：移動
整合左右移動、跳躍及攻擊動作
評量標準
按下左右鍵，角色左右移動
按下向上鍵，角色跳躍
按下 A 鍵，角色切換攻擊造型
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
    await this.case04();
  }

  // 向右移動0.5秒，最後x座標要大於原來的x座標
  async case01() {
    //action
    await this.judge.press("ArrowRight", 100);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    var firstEle = values[0]["x"];
    var lastEle = values[values.length - 1]["x"];
    var val = lastEle - firstEle;
    this.callback("case01", val > 0, "移動到右側");
    sprite["records"] = [];
  }

  // 向左移動1秒，最後x座標要小於原來的x座標
  async case02() {
    //action
    await this.judge.press("ArrowLeft", 200);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    //console.log("case02:", values);
    var firstEle = values[0]["x"];
    var lastEle = values[values.length - 1]["x"];
    var val = lastEle + firstEle;
    this.callback("case02", values[13]["x"] == 40, "移動到左側");
    sprite["records"] = [];
  }

  // 檢查攻擊造型是否有改變
  async case03() {
    //action
    await this.judge.press("a", 500);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    //console.log("value:", values);
    var condition =
      values[0]["currentCostume"] == 0 && //換回造型 (接續case02)
      values[1]["currentCostume"] == 1 && //防禦造型1
      values[2]["currentCostume"] == 2 && //防禦造型2
      values[3]["currentCostume"] == 0; //換回造型

    this.callback("case03", condition, "攻擊造型切換");
    sprite["records"] = [];
  }

  // 跳一下
  async case04() {
    //action
    this.judge.press("ArrowLeft", 200);
    await this.judge.press("ArrowUp", 10);
    //check
    var key = Object.keys(this.judge.sprites)[0];
    var sprite = this.judge.sprites[key];
    var values = sprite["records"];
    console.log("case04:", values);
    var condition =
      values[0]["x"] == 30 &&
      values[0]["y"] < 2 &&
      values[1]["x"] == 30 &&
      values[1]["y"] > 10;
    this.callback("case04", condition, "移動並且跳起來");
    sprite["records"] = [];
  }
};