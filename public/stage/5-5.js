/*
{Cat: 2, Gobo: 7, GoboFire: 9, Dragon: 0}
- 一個飛行夥伴，會隨著小貓移動 [Gobo]
  x座標? y座標? 有沒有偏移量?
- 按 f 鍵 Gobo 夥伴會攻擊飛龍
  GoboFire?
- 飛龍受到攻擊會消失
  刪除分身? 顯示隱藏?
- 飛龍消失後會再出現
*/
window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
    window.ss = function () {
      console.log(window.judge.sprites);
      console.log(window.judge.variables);
      console.log(window.judge.collisionCounts);
    };
  }
  async start(callback) {
    this.callback = callback;
    //await this.case01();
  }

  // {Cat: 2, Gobo: 7, GoboFire: 9, Dragon: 0}
  async case01() {
    try {
      var sprites = this.judge.sprites_name();
      var cat = sprites["Cat"][0];
      var gobo = sprites["Gobo"][0];
      await this.judge.press("ArrowRight", 200);
      await this.judge.delay(500);
      var fllow1 = cat.x - gobo.x;
      await this.judge.press("ArrowLeft", 400);
      await this.judge.delay(600);
      var fllow2 = cat.x - gobo.x;
      await this.judge.press("ArrowRight", 100);
      await this.judge.delay(500);
      var fllow3 = cat.x - gobo.x;
      this.callback(
        "case01",
        ((fllow1 == fllow2) == fllow3) == 0,
        "飛行夥伴隨著小貓移動"
      );
    } catch (e) {
      this.callback("case01", false, "飛行夥伴隨著小貓移動");
    }
  }

  // 按 f 鍵 Gobo 夥伴會攻擊飛龍
  // 假設飛龍遭受到碰撞視為攻擊
  async case02_case03_case04() {
    await this.judge.delay(1000);
    var monitorId_before_attach = this.judge.sprites_name()['Dragon'][1].id;    
    await this.judge.press("f", 50);
    await this.judge.delay(500);
    var info = this.judge.collisionCounts;
    console.log(info);
    var monitorId_after_attach = this.judge.sprites_name()['Dragon'][1].id;
    this.callback(
      "case02",
      info["Dragon"] == 0 && info["GoboFire"] > 1,
      "飛行夥伴攻擊飛龍"
    );
    
    this.callback(
      "case03",
      monitorId_before_attach != monitorId_after_attach,
      "飛龍受到攻擊會消失"
    );
    this.callback(
      "case04",
      monitorId_before_attach != monitorId_after_attach,
      "飛龍消失後會再出現"
    );
  }
};
