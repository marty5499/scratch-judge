window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
    setFrameRate(3);
  }
  async start(callback) {
    this.callback = callback;
    await this.case01();
    await this.case02();
  }

  async case01() {
    try {
      var sprite1 = this.judge.sprites[Object.keys(this.judge.sprites)[2]];
      var sprite2 = this.judge.sprites[Object.keys(this.judge.sprites)[2]];
      await this.judge.delay(150);
      this.judge.press("ArrowUp", 200);
      await this.judge.press(" ", 10);
      await this.judge.delay(200);
      window.ss = this.judge.sprites;
      var condition = Object.keys(this.judge.sprites).length >= 4;
      this.callback("case01", condition, "主角攻擊敵人");
    } catch (e) {
      this.callback("case01", false, "主角攻擊敵人");
    }
  }

  async case02() {
    try {
      var catCollisionTimes = this.judge.collisionCounts["Cat"];
      var dragonCollisionTimes = this.judge.collisionCounts["Dragon"];
      var condition = catCollisionTimes >= 2 && dragonCollisionTimes == 1;
      this.callback("case02", condition, "主角碰撞");
    } catch (e) {
      this.callback("case02", false, "主角碰撞");
    }
  }
};
