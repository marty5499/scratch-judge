/*
角色:
- 貓: Cat
- 天上石頭: Rocks
- 路邊石頭: Rocks2
- 血量: Sprite1
- 背景: Sprite2

評測條件
1. 石頭掉下來
2. 小貓碰撞石頭
3. 血條有減少
4. 小貓血量變數減少

*/
window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    judge.fixedRandom = 0.5;
    super(judge);
    window.ss = function () {
      console.log(window.judge.sprites);
      console.log(window.judge.variables);
      console.log(window.judge.collisionCounts);
    };
  }
  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // {Cat: 2, Gobo: 7, GoboFire: 9, Dragon: 0}
  async case01() {
    try {
      var dec_blood = 0;
      var hit_cat = 0;
      await this.judge.delay(3000);
      var info = this.judge.timeline.info();
      for (var i of info) {
        if (i.eventName == "sprite") {
          var update = i.update;
          if (
            update[0] == "Sprite1" &&
            update[1] == "currentCostume" &&
            update[2].visible == true &&
            update[2].currentCostume == 1
          ) {
            dec_blood++;
            console.log("血量減少...", update[2].currentCostume);
          }
        }
        if (
          i.eventName == "collision" &&
          i.sprite[0] == "Cat" &&
          i.sprite[1] == "Rocks"
        ) {
          hit_cat++;
          console.log("貓被砸到");
        }
      }
      console.log(dec_blood, hit_cat);
      this.callback(
        "case01",
        dec_blood == 10 && hit_cat == 5,
        "石頭碰撞，血量減少"
      );
    } catch (e) {
      this.callback("case01", false, "石頭碰撞，血量減少");
    }
  }

  // 按 f 鍵 Gobo 夥伴會攻擊飛龍
  // 假設飛龍遭受到碰撞視為攻擊
  async case02_case03_case04() {
    await this.judge.delay(1000);
    var monitorId_before_attach = this.judge.sprites_name()["Dragon"][1].id;
    await this.judge.press("f", 50);
    await this.judge.delay(500);
    var info = this.judge.collisionCounts;
    console.log(info);
    var monitorId_after_attach = this.judge.sprites_name()["Dragon"][1].id;
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
