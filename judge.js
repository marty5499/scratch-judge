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
    return new Promise((resolve) => setTimeout(resolve, parseInt(ms * window.runSpeed)));
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
        this.monitorClonesUpdate(target);
      }
    });
  }

  monitorClonesUpdate(target) {
    var self = this;
    var clones = target.sprite.clones;
    var clonesProxy = new Proxy(clones, {
      set: function (clones, property, value, receiver) {
        var target = clones.slice(-1)[0];
        if (typeof target == "undefined")
          return Reflect.set(clones, property, value, receiver);
        self.sprites[target.id] = {
          target: target,
          name: target.sprite.name,
          id: target.id,
          x: target.x,
          y: target.y,
          direction: target.direction,
          currentCostume: target.currentCostume,
          records: [],
        };
        self.registerObservers(target);
        return Reflect.set(clones, property, value, receiver);
      },
    });
    target.sprite.clones = clonesProxy;
  }

  registerObservers(target) {
    this.monitorProperty(target, "x", true);
    this.monitorProperty(target, "y", true);
    this.monitorProperty(target, "direction");
    this.monitorProperty(target, "currentCostume");
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
          if (Math.floor(originalValue) !== Math.floor(newValue)) {
            originalValue = newValue;
            judge.onUpdate(target);
          } else {
            originalValue = newValue; // 仍然更新值但不触发
          }
        } else {
          originalValue = newValue;
          judge.onUpdate(target);
        }
      },
      configurable: true,
    });
  }

  onUpdate(sprite) {
    const spriteRecord = this.sprites[sprite.id];
    const properties = ["x", "y", "direction", "currentCostume"];
    let updated = false;
    const timestamp = Date.now(); // 添加时间戳
    properties.forEach((prop) => {
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
        currentCostume: sprite.currentCostume,
        timestamp: timestamp, // 添加时间戳记录
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
