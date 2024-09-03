/*
評測目標4：創造角色的動作造型(跳躍、二段跳躍)

範例操作

https://scratch.mit.edu/projects/979020087

按⭡跳躍

程式概念
序列
迴圈
學習重點
準備二種造型：跑步及跳躍
向上跳躍時切換造型
評量標準
按下向上鍵，角色切換成跳躍造型，角色向上移動100後向下移動100，落地後換回跑步造型
*/

window.TestCase = class TestCase extends RootTestCase {
  constructor(judge) {
    super(judge);
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  // 向上跳，看y座標是否有改變
  async case01() {
    try {
      //action
      await this.judge.press("ArrowUp", 50);
      await this.judge.delay(500);
      var timeline = this.judge.timeline.info();
      //console.log(timeline[0]["Sprite1"][1]);
      //console.log(timeline[timeline.length - 1]["Sprite1"][1]);
      //console.log(timeline);
      this.callback(
        "case01",
        timeline[0]["Sprite1"][1] !=
          timeline[timeline.length - 1]["Sprite1"][1] && timeline.length > 10,
        "換姿勢跳起來"
      );
    } catch (e) {
      this.callback("case01", false, "換姿勢跳起來");
    }
  }
};
