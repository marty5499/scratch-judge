/*
https://scratch.mit.edu/projects/979029128

按⭢向右移動
按⭠向左移動

程式概念
序列
迴圈
判斷式
學習重點
準備三種造型，站立、向左、向右
左右移動時切換造型
積木：造型換成
評量標準
按下向右鍵，角色先換成向右造型，角色向右移動，移動結束換成站立造型
按下向左鍵，角色先換成向左造型，角色向左移動，移動結束換成站立造型
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
    try {
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var costumeA = sprite.target.currentCostume;
      this.judge.press("ArrowRight", 200);
      await this.judge.delay(50);
      var costumeB = sprite.target.currentCostume;
      await this.judge.delay(200);
      var costumeC = sprite.target.currentCostume;
      console.log("case01:", sprite["records"]);
      this.callback(
        "case01",
        costumeA == costumeC && costumeA != costumeB,
        "判斷人物姿勢改變"
      );
      sprite["records"] = [];
    } catch (e) {
      this.callback("case01", false, "判斷人物姿勢改變");
    }
  }

  // 向右移動0.5秒，最後x座標要大於原來的x座標
  async case02() {
    try {
      //action
      await this.judge.press("ArrowRight", 500);
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case02:", values);
      var firstEle = values[0]["x"];
      var lastEle = values[values.length - 1]["x"];
      var val = lastEle - firstEle;
      this.callback("case02", val > 0, "移動到右側");
      sprite["records"] = [];
    } catch (e) {
      this.callback("case02", false, "移動到右側");
    }
  }

  // 向左移動1秒，最後x座標要小於原來的x座標
  async case03() {
    try {
      //action
      await this.judge.press("ArrowLeft", 1000);
      await this.judge.delay(100); //等待造型變換
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case03:", values);
      var ele = values[values.length - 1];
      this.callback(
        "case03",
        ele["x"] == -270 && ele["direction"] == -90,
        "移動到左側"
      );
      sprite["records"] = [];
    } catch (e) {
      this.callback("case03", false, "移動到左側");
    }
  }
};
