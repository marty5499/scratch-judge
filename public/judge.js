class Judge {
  constructor(canvas, vm, scriptSrc, TestCase) {
    this.canvas = canvas;
    this.vm = vm;
    this.scriptSrc = scriptSrc;
    this.TestCase = TestCase;
    this.sprites = {};
    this.variables = {};
    this.collisions = new Set(); // 用於記錄已發生的碰撞
    this.collisionCounts = {}; // 用於紀錄每個物件的碰撞次數
    this.questionHandlerRegistered = false;
    this.monitorVariableChanges();
  }

  async clickSprite(target) {
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();
    const costume = target.sprite.costumes[target.currentCostume];
    const width =
      costume.bitmapResolution === 2
        ? costume.rotationCenterX * 2
        : costume.rotationCenterX;
    const height =
      costume.bitmapResolution === 2
        ? costume.rotationCenterY * 2
        : costume.rotationCenterY;
    const x =
      rect.left + (target.x + canvas.width / 2) * (rect.width / canvas.width);
    const y =
      rect.top +
      (canvas.width / 2 - target.y - height * 1.5) *
        (rect.height / canvas.height);
    this.vm.postIOData("mouse", {
      x: x,
      y: y,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      isDown: true,
    });
    await this.delay(100);
    this.vm.postIOData("mouse", {
      x: x,
      y: y,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      isDown: false,
    });
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
    return new Promise((resolve) =>
      setTimeout(resolve, parseInt(ms * window.runSpeed))
    );
  }

  loadSprite() {
    this.vm.runtime.targets.forEach((target) => {
      if (!target.isStage) {
        const costume = target.sprite.costumes[target.currentCostume];
        const width =
          costume.bitmapResolution === 2
            ? costume.rotationCenterX * 2
            : costume.rotationCenterX;
        const height =
          costume.bitmapResolution === 2
            ? costume.rotationCenterY * 2
            : costume.rotationCenterY;
        this.sprites[target.id] = {
          target: target,
          name: target.sprite.name,
          id: target.id,
          x: target.x,
          y: target.y,
          width: width,
          height: height,
          direction: target.direction,
          currentCostume: target.currentCostume,
          records: [],
        };
        this.registerObservers(target);
        this.monitorClonesUpdate(target);
        this.collisionCounts[target.sprite.name] = 0; // 初始化碰撞次數
      }
    });
  }

  enterInput(text) {
    const inputElement = document.getElementById("scratchInput");
    if (inputElement) {
      inputElement.value = text;

      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        code: "Enter",
        charCode: 13,
        keyCode: 13,
        which: 13,
      });

      inputElement.dispatchEvent(event);
    }
  }

  monitorClonesUpdate(target) {
    var self = this;
    var clones = target.sprite.clones;
    var clonesProxy = new Proxy(clones, {
      set: function (clones, property, value, receiver) {
        var target = clones.slice(-1)[0];
        if (typeof target == "undefined")
          return Reflect.set(clones, property, value, receiver);
        const costume = target.sprite.costumes[target.currentCostume];
        const width =
          costume.bitmapResolution === 2
            ? costume.rotationCenterX * 2
            : costume.rotationCenterX;
        const height =
          costume.bitmapResolution === 2
            ? costume.rotationCenterY * 2
            : costume.rotationCenterY;
        self.sprites[target.id] = {
          target: target,
          name: target.sprite.name,
          id: target.id,
          x: target.x,
          y: target.y,
          width: width,
          height: height,
          direction: target.direction,
          currentCostume: target.currentCostume,
          records: [],
        };
        self.registerObservers(target);
        self.collisionCounts[target.sprite.name] = 0; // 初始化碰撞次數
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
            originalValue = newValue;
          }
        } else {
          originalValue = newValue;
          judge.onUpdate(target);
        }
      },
      configurable: true,
    });
  }

  monitorVariableChanges() {
    var vm = this.vm;
    var self = this;
    const stage = this.vm.runtime.getTargetForStage();
    for (let variableId in stage.variables) {
      let variable = stage.variables[variableId];
      variable.records = [];
      this.variables[variable.name] = variable;
      let originalValue = variable.value;
      Object.defineProperty(variable, "value", {
        get: function () {
          return originalValue;
        },
        set: function (newValue) {
          if (originalValue !== newValue) {
            originalValue = newValue;
            self.variables[variable.name]["records"].push({
              value: newValue,
              timestamp: Date.now(),
            });
            console.log(`Variable ${variable.name} changed to ${newValue}`);
          }
        },
        configurable: true,
      });
    }
  }

  checkCollision(sprite1, sprite2) {
    const rect1 = {
      x: sprite1.x - sprite1.width / 2,
      y: sprite1.y - sprite1.height / 2,
      width: sprite1.width,
      height: sprite1.height,
    };

    const rect2 = {
      x: sprite2.x - sprite2.width / 2,
      y: sprite2.y - sprite2.height / 2,
      width: sprite2.width,
      height: sprite2.height,
    };

    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  onUpdate(sprite) {
    const spriteRecord = this.sprites[sprite.id];
    const properties = ["x", "y", "direction", "currentCostume"];
    let updated = false;
    const timestamp = Date.now();
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
        timestamp: timestamp,
      });

      for (const spriteId in this.sprites) {
        const otherSprite = this.sprites[spriteId];
        if (
          otherSprite.id !== sprite.id &&
          spriteRecord.name !== otherSprite.name
        ) {
          const collisionKey = `${sprite.id}-${otherSprite.id}`;
          if (
            this.checkCollision(spriteRecord, otherSprite) &&
            !this.collisions.has(collisionKey)
          ) {
            console.log(
              `Collision detected between ${spriteRecord.name} and ${otherSprite.name}`
            );
            this.collisions.add(collisionKey);
            this.collisionCounts[spriteRecord.name]++;
            this.collisionCounts[otherSprite.name]++;
            // 在這裡觸發碰撞事件
          } else if (
            !this.checkCollision(spriteRecord, otherSprite) &&
            this.collisions.has(collisionKey)
          ) {
            // 如果兩個物體不再碰撞，移除碰撞記錄，允許未來再次觸發
            this.collisions.delete(collisionKey);
          }
        }
      }
    }
  }

  collisionTimes(name) {
    return this.collisionCounts[name] || 0;
  }

  registerQuestionHandler() {
    if (!this.questionHandlerRegistered) {
      this.vm.runtime.on("QUESTION", (question) => {
        const existingInput = document.getElementById("scratchInput");
        if (existingInput) {
          document.body.removeChild(existingInput);
        }

        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.id = "scratchInput";
        document.body.appendChild(inputElement);

        inputElement.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            const answer = inputElement.value;
            this.vm.runtime.emit("ANSWER", answer);
            document.body.removeChild(inputElement);
          }
        });
      });
      this.questionHandlerRegistered = true;
    }
  }

  async start() {
    this.testcase = new this.TestCase(this);
    this.loadSprite();
    this.vm.greenFlag();
    var ele = document.getElementById("result");
    this.registerQuestionHandler();
    this.checkIfExecutionComplete(this);
    await this.testcase.start(function (name, result, msg) {
      if (result) {
        ele.innerHTML += `<h3 style="background-color:#aaffaa">${name}: 測試 ${msg} 成功</h3>`;
      } else {
        ele.innerHTML += `<h3 style="background-color:#ffaaaa">${name}: 測試 ${msg} 失敗</h3>`;
      }
    });
  }

  async restart() {
    this.vm.stopAll();
    this.sprites = {};
    this.collisions = new Set(); // 重置碰撞記錄
    this.collisionCounts = {}; // 重置碰撞次數
    this.loadSprite();
    this.vm.greenFlag();
  }

  checkIfExecutionComplete(self) {
    if (vm.runtime.threads.length === 0) {
      const ansPNG = self.scriptSrc.replace(".js", ".png");
      self.testcase.onCompleted(ansPNG);
    } else {
      // 如果還有程序在執行，過一段時間再檢查一次
      setTimeout(() => self.checkIfExecutionComplete(self), 100); // 每100毫秒檢查一次
    }
  }
}