/*
Unit 2-4
評測目標4：賦予角色跳躍時攻擊或防禦的功能

範例操作

https://scratch.mit.edu/projects/979055577

按⭢向右移動
按⭠向左移動
按⭡跳躍
按 D 防禦

程式概念
序列
迴圈
學習重點
迴轉方式設為左右
積木：面朝
積木：移動
整合左右移動、跳躍及防禦動作
評量標準
按下左右鍵，角色左右移動
按下向上鍵，角色跳躍
按下 D 鍵，角色切換防禦造型
*/

window.TestCase = class TestCase extends RootTestCase{
  constructor(judge) {
    super(judge);
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
    try {
      //action
      this.judge.press("ArrowRight", 300);
      await this.judge.delay(600);
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case01:", values);
      var firstEle = values[0]["x"];
      var lastEle = values[values.length - 1]["x"];
      var val = lastEle - firstEle;
      this.callback("case01", val > 0, "移動到右側");
      sprite["records"] = [];
    } catch (e) {
      this.callback("case01", false, "移動到右側");
    }
  }

  // 向左移動1秒，最後x座標要小於原來的x座標
  async case02() {
    try {
      //action
      this.judge.press("ArrowLeft", 200);
      await this.judge.delay(200);
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case02:", values);
      this.callback(
        "case02",
        values[values.length - 1]["x"] <= 30,
        "移動到左側"
      );
      sprite["records"] = [];
    } catch (e) {
      this.callback("case02", false, "移動到左側");
    }
  }

  // 檢查防禦造型是否有改變
  async case03() {
    try {
      //action
      this.judge.press("d", 200);
      await this.judge.delay(400);
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case03:", values);
      var condition =
        values[0]["currentCostume"] == 0 && //換回造型 (接續case02)
        values[1]["currentCostume"] == 1 && //防禦造型1
        values[2]["currentCostume"] == 2 && //防禦造型2
        values[3]["currentCostume"] == 0; //換回造型

      this.callback("case03", condition, "防禦造型切換");
      sprite["records"] = [];
    } catch (e) {
      this.callback("case03", false, "防禦造型切換");
    }
  }

  // 跳一下
  async case04() {
    try {
      //action
      this.judge.press("ArrowLeft", 200);
      this.judge.press("ArrowUp", 100);
      await this.judge.delay(100);
      this.judge.press("d", 100);
      await this.judge.delay(200);
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case04:", values);
      var condition =
        values[0]["x"] <= 10 &&
        values[0]["currentCostume"] == 0 &&
        values[16]["x"] <= -70 &&
        values[16]["currentCostume"] == 1 &&
        values[24]["x"] <= -90 &&
        values[24]["currentCostume"] == 2;
      this.callback("case04", condition, "移動＋跳起來時候防禦");
      sprite["records"] = [];
    } catch (e) {
      this.callback("case04", false, "移動＋跳起來時候防禦");
    }
  }
};
