window.TestCase = class TestCase {
  constructor(judge) {
    this.judge = judge;
  }

  async start(callback) {
    this.callback = callback;
    await this.case01();
  }

  async case01() {
    const monitors = this.judge.vm.runtime.monitorBlocks._blocks;
    this.judge.showVariableMonitor("愛心");

    await this.judge.delay(500); // 等待一秒以確保字串顯示
    this.judge.showVariableMonitor("愛心");
    await this.judge.delay(500); // 等待一秒以確保字串顯示
    this.judge.showVariableMonitor("愛心");
    await this.judge.delay(500); // 等待一秒以確保字串顯示
    this.judge.showVariableMonitor("愛心");
    await this.judge.delay(500); // 等待一秒以確保字串顯示
    this.judge.showVariableMonitor("愛心");

    this.callback("case01", true, `game`);
    // sprite["records"] = [];
  }
};
