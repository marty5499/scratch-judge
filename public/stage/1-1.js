window.TestCase = class TestCase extends RootTestCase{
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
    await this.case02();
  }

  // 向右移動0.5秒，最後x座標要大於原來的x座標
  async case01() {
    try {
      //action
      await this.judge.press("ArrowRight", 500);
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
    //action
    try {
      await this.judge.press("ArrowLeft", 1000);
      //check
      var key = Object.keys(this.judge.sprites)[0];
      var sprite = this.judge.sprites[key];
      var values = sprite["records"];
      console.log("case02:", values);
      var firstEle = values[0]["x"];
      var lastEle = values[values.length - 1]["x"];
      var val = lastEle + firstEle;
      this.callback("case02", val == 0, "移動到左側");
      sprite["records"] = [];
    } catch (e) {
      this.callback("case02", false, "移動到左側");
    }
  }
};
