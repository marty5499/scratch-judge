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
          direction: target.direction,
          currentCostume: target.currentCostume,
          records: [],
        };
        this.registerObservers(target);
      }
    });
  }

  registerObservers(target) {
    this.monitorProperty(target, 'x', true);
    this.monitorProperty(target, 'y', true);
    this.monitorProperty(target, 'direction');
    this.monitorProperty(target, 'currentCostume');
  }

  monitorProperty(target, propName, isCoordinate = false) {
    const judge = this;
    let originalValue = target[propName];
    Object.defineProperty(target, propName, {
      get: function () {
        return originalValue;
      },
      set: function (newValue) {
        if (isCoordinate) {
          // Trigger update only if the integer part changes
          if (Math.floor(originalValue) !== Math.floor(newValue)) {
            originalValue = newValue;
            judge.onUpdate(this);
          } else {
            originalValue = newValue; // Still update the value but do not trigger
          }
        } else {
          originalValue = newValue;
          judge.onUpdate(this);
        }
      },
      configurable: true,
    });
  }

  onUpdate(sprite) {
    const spriteRecord = this.sprites[sprite.id];
    const properties = ['x', 'y', 'direction', 'currentCostume'];
    let updated = false;

    properties.forEach(prop => {
      if (sprite[prop] !== spriteRecord[prop]) {
        spriteRecord[prop] = sprite[prop];
        updated = true;
      }
    });

    if (updated) {
      spriteRecord["records"].push({
        x: sprite.x,
        y: sprite.y,
        direction: sprite.direction,
        currentCostume: sprite.currentCostume
      });
    }
  }

  async start() {
    this.testcase = new this.TestCase(this);
    this.loadSprite();
    this.vm.greenFlag();
    var ele = document.getElementById("result");
    await this.testcase.start(function (name, result, msg) {
      if (result) {
        ele.innerHTML += `<h3 style="background-color:#aaffaa">${name}: 測試 ${msg} 成功</h3>`;
      } else {
        ele.innerHTML += `<h3 style="background-color:#ffaaaa">${name}: 測試 ${msg} 失敗</h3>`;
      }
    });
  }
}
