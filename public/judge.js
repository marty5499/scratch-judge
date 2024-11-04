class Timeline {
  constructor() {
    this._timeline = [];
  }

  push(eventName, name, value) {
    var info = {};
    info[name] = value;
    this.pushObj(eventName, info);
  }

  pushObj(eventName, info) {
    info["eventName"] = eventName;
    if (!("timestamp" in info)) {
      info["timestamp"] = Date.now();
    }
    this._timeline.push(info);
  }

  info() {
    return this._timeline;
  }

  stringify() {
    return JSON.stringify(this._timeline);
  }
}

class Judge {
  constructor(canvas, vm, scriptSrc, TestCase) {
    this.canvas = canvas;
    this.vm = vm;
    this.fixedRandom = 0.5;
    this.scriptSrc = scriptSrc;
    this.TestCase = TestCase;
    this.clones = {}; // 分身建立、刪除紀錄
    this.sprites = {}; // 所有角色
    this.variables = {}; // 所有變數
    this.collisions = new Set(); // 用於記錄已發生的碰撞
    this.collisionCounts = {}; // 用於紀錄每個物件的碰撞次數
    this.questionHandlerRegistered = false;
    this.monitorVariableChanges();
    // 添加音效播放事件的監聽
    this.playedSounds = new Set();
    this.hookIntoSoundBlocks();
    this.hookIntoBroadcastBlocks();
    this.timeline = new Timeline();
  }

  async restart() {
    this.vm.stopAll();
    this.fixedRandom = 0.5;
    this.clones = {}; // 分身建立、刪除紀錄
    this.variables = {}; // 所有變數
    this.questionHandlerRegistered = false;
    this.monitorVariableChanges();
    this.timeline = new Timeline();
    this.sprites = {};
    this.collisions = new Set(); // 重置碰撞記錄
    this.collisionCounts = {}; // 重置碰撞次數
    this.playedSounds = new Set();
    this.loadSprite();
    this.vm.greenFlag();
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
    var bias = 0;
    this.vm.postIOData("mouse", {
      x: x + bias,
      y: y + bias,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      isDown: true,
    });
    await this.delay(100);
    this.vm.postIOData("mouse", {
      x: x + bias,
      y: y + bias,
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
          //visible: target.visible,
          //isOriginal: target.isOriginal,
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

        self.onCloneState(target, "create"); // 觸發分身新增事件
        self.registerObservers(target);
        self.collisionCounts[target.sprite.name] = 0; // 初始化碰撞次數
        return Reflect.set(clones, property, value, receiver);
      },
      deleteProperty: function (clones, property) {
        const target = clones[property];
        self.onCloneState(target, "delete"); // 觸發分身刪除事件
        delete self.sprites[target.id]; // 更新分身記錄
        return Reflect.deleteProperty(clones, property);
      },
    });
    target.sprite.clones = clonesProxy;
  }

  // 新增分身事件的處理函數
  onCloneState(target, action) {
    var id = target.id;
    var name = target.sprite.name;
    if (!(name in this.clones)) {
      this.clones[name] = {};
    }
    if (!(id in this.clones[name])) {
      this.clones[name][id] = [];
    }
    var info = {
      id: id,
      name: name,
      state: action,
      currentCostume: target.currentCostume,
      timestamp: Date.now(),
    };
    this.clones[name][id].push(info);
    //console.log("Clone:", this.clones);
    this.timeline.pushObj("clone_" + action, info);
    // 可以在這裡添加更多的邏輯處理，如觸發自定義事件等
  }

  registerObservers(target) {
    this.monitorProperty(target, "x", true);
    this.monitorProperty(target, "y", true);
    this.monitorProperty(target, "direction");
    this.monitorProperty(target, "currentCostume");
    this.monitorProperty(target, "visible");
    this.monitorProperty(target, "isOriginal");
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
            judge.onUpdate(target, propName, newValue);
          } else {
            originalValue = newValue;
          }
        } else {
          originalValue = newValue;
          judge.onUpdate(target, propName, newValue);
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
            var name = variable.name;
            self.timeline.push("var_update", name, newValue);
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

  onUpdate(sprite, propName, newValue) {
    const spriteRecord = this.sprites[sprite.id];
    if (spriteRecord == null) return;
    const properties = [
      "x",
      "y",
      "direction",
      "currentCostume",
      "visible",
      "isOriginal",
    ];
    let updated = false;
    const timestamp = Date.now();
    properties.forEach((prop) => {
      if (sprite[prop] !== spriteRecord[prop]) {
        spriteRecord[prop] = sprite[prop];
        updated = true;
      }
    });

    if (updated) {
      var rec = {
        x: sprite.x,
        y: sprite.y,
        visible: sprite.visible,
        isOriginal: sprite.isOriginal,
        direction: sprite.direction,
        currentCostume: sprite.currentCostume,
        timestamp: timestamp,
      };
      spriteRecord["records"].push(rec);
      this.timeline.push("sprite", "update", [
        sprite.sprite.name,
        propName,
        rec,
      ]);
      for (const spriteId in this.sprites) {
        const otherSprite = this.sprites[spriteId];
        // 不可見的物件不列入碰撞
        if (!otherSprite.target.visible || !sprite.visible) continue;
        if (
          otherSprite.id !== sprite.id &&
          spriteRecord.name !== otherSprite.name
        ) {
          const collisionKey = `${sprite.id}-${otherSprite.id}`;
          if (
            this.checkCollision(spriteRecord, otherSprite) &&
            !this.collisions.has(collisionKey)
          ) {
            //console.log(`Collision detected between ${spriteRecord.name} and ${otherSprite.name}`);
            this.timeline.push("collision", "sprite", [
              spriteRecord.name,
              otherSprite.name,
            ]);
            this.collisions.add(collisionKey);
            this.collisionCounts[spriteRecord.name]++;
            this.collisionCounts[otherSprite.name]++;
            //console.log(this.collisionCounts);
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

  hookIntoBroadcastBlocks() {
    const broadcastBlocks = ["event_broadcast", "event_broadcastandwait"];
    const opcodeFunctions = this.vm.runtime._primitives;
    const judgeInstance = this;

    broadcastBlocks.forEach((opcode) => {
      const originalFunction = opcodeFunctions[opcode];
      if (typeof originalFunction !== "function") {
        console.warn(
          `Original function for opcode ${opcode} is not a function.`
        );
        return;
      }
      opcodeFunctions[opcode] = function (args, util) {
        const broadcastMessage =
          args.BROADCAST_OPTION && args.BROADCAST_OPTION.name;
        if (broadcastMessage) {
          judgeInstance.timeline.push("broadcast", "message", broadcastMessage);
        } else {
          console.warn(
            `Broadcast message not found in args for opcode '${opcode}':`,
            args
          );
        }
        return originalFunction.call(this, args, util);
      };
    });
  }

  hookIntoSoundBlocks() {
    const soundBlocks = [
      "sound_play",
      "sound_playuntildone",
      "sound_stopallsounds",
    ];
    const opcodeFunctions = this.vm.runtime._primitives;
    const judgeInstance = this;

    soundBlocks.forEach((opcode) => {
      const originalFunction = opcodeFunctions[opcode];

      opcodeFunctions[opcode] = function (args, util) {
        const target = util.target;
        const soundName = args.SOUND_MENU;

        if (opcode === "sound_play" || opcode === "sound_playuntildone") {
          if (soundName && !judgeInstance.playedSounds.has(soundName)) {
            // 记录音效播放事件，只记录音效名称
            judgeInstance.timeline.push("sound_play", "sound", {
              targetName: target.getName(),
              soundName: soundName,
              timestamp: Date.now(),
            });
            // 将音效名称添加到已播放的集合中
            judgeInstance.playedSounds.add(soundName);
          }
        } else if (opcode === "sound_stopallsounds") {
          judgeInstance.timeline.push("sound_stopAll", "sound", {
            timestamp: Date.now(),
          });
        }
        return originalFunction.call(this, args, util);
      };
    });
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

  sprites_id() {
    return this.sprites;
  }

  sprites_name() {
    var sprites_name = {};
    for (const target of this.vm.runtime.targets) {
      var spriteName = target["sprite"]["name"];
      if (!(spriteName in sprites_name)) {
        sprites_name[spriteName] = [];
      }
      sprites_name[spriteName].push(target);
    }
    return sprites_name;
  }

  checkIfExecutionComplete(self) {
    if (self.vm.runtime.threads.length === 0) {
      const ansPNG = self.scriptSrc.replace(".js", ".png");
      self.testcase.onCompleted(ansPNG);
    } else {
      // 如果还有程序在执行，过一段时间再检查一次
      setTimeout(() => self.checkIfExecutionComplete(self), 100); // 每100毫秒检查一次
    }
  }
}
