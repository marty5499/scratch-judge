window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    //*
    for (var i = 0; i < 3; i++) {
      this.judge.press(" ", 50);
      await this.judge.delay(500);
    }

    console.log("\n", this.judge.collisionCounts);

    this.callback(
      "case01",
      this.judge.collisionCounts["Fish"] > 70,
      `送愛心給魚`
    );
  }
};
