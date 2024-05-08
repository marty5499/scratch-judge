class Judge {
  constructor(vm, TestCase) {
    this.vm = vm;
    this.TestCase = TestCase;
    this.sprites = {};
  }

  async press(key, ms) {
    this.vm.postIOData("keyboard", {
      key: key,
      isDown: true,
    });
    await this.delay(ms);
    this.vm.postIOData("keyboard", {
      key: key,
      isDown: false,
    });
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  loadSprite() {
    this.vm.runtime.targets.forEach((target) => {
      if (!target.isStage) {
        this.sprites[target.id] = {
          target: target,
          name: target.sprite.name,
          id: target.id,
          x: target.x,
          y: target.y,
          records: [],
        };
      }
    });
  }

  checkForUpdates() {
    // Check each sprite for changes
    for (const id in this.sprites) {
      const sprite = this.sprites[id];
      if (sprite.target.x !== sprite.x || sprite.target.y !== sprite.y) {
        // Update detected, call onUpdate
        this.onUpdate(sprite);
        // Update last known position
        sprite.x = sprite.target.x;
        sprite.y = sprite.target.y;
      }
    }
  }

  async start() {
    this.testcase = new this.TestCase(this);
    this.loadSprite();
    this.vm.greenFlag();
    // Start periodic check for updates
    setInterval(() => this.checkForUpdates(), 100); // check every 100 milliseconds
    await this.testcase.case01();
  }

  onUpdate(sprite) {
    sprite["records"].push(sprite.target.x);
  }
}
