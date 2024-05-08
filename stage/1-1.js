class TestCase {
  constructor(judge) {
    this.judge = judge;
  }
  async case01() {
    var key = Object.keys(this.judge.sprites)[0];
    await this.judge.press("ArrowRight", 500);
    var sprite = this.judge.sprites[key];
    console.log(sprite["records"]);
    sprite["records"] = [];

    await this.judge.press("ArrowLeft", 1000);
    console.log(sprite["records"]);
  }
}

window.TestCase = TestCase;
