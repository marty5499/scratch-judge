window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
    //setFrameRate(2);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    console.log("Case01....");
    await this.judge.delay(1500);
    var info = this.judge.timeline.info();
    var del_clone = 0;
    for (var i of info) {
      if (i.eventName == "clone_delete") {
        del_clone++;
      }
    }
    this.callback("case01", del_clone > 10, `分數與碰撞10次以上`);
  }
};
