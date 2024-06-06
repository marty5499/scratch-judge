class Judge {
  constructor(canvas, vm, TestCase) {
    this.canvas = canvas;
    this.vm = vm;
    this.TestCase = TestCase;
    this.sprites = {};
    this.questionHandlerRegistered = false;
  }

  async clickSprite(target) {
    // 获取 canvas 和其位置
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();
    // 获取 target 的宽度和高度
    const costume = target.sprite.costumes[target.currentCostume];
    const width =
      costume.bitmapResolution === 2
        ? costume.rotationCenterX * 2
        : costume.rotationCenterX;
    const height =
      costume.bitmapResolution === 2
        ? costume.rotationCenterY * 2
        : costume.rotationCenterY;
    // 计算相对于 canvas 的坐标
    const x =
      rect.left + (target.x + canvas.width / 2) * (rect.width / canvas.width); // 将 Scratch 的坐标转换为 canvas 坐标，并调整到中心点
    const y =
      rect.top +
      (canvas.width / 2 - target.y - height * 1.5) *
        (rect.height / canvas.height); // 将 Scratch 的坐标转换为 canvas 坐标，并调整到中心点
    // 模拟鼠标按下
    this.vm.postIOData("mouse", {
      x: x,
      y: y,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      isDown: true,
    });
    await this.delay(100); // 等待一点时间
    // 模拟鼠标释放
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
    this.registerQuestionHandler(); // 確保只註冊一次事件處理器
    await this.testcase.start(function (name, result, msg) {
      if (result) {
        ele.innerHTML += `<h3 style="background-color:#aaffaa">${name}: 測試 ${msg} 成功</h3>`;
      } else {
        ele.innerHTML += `<h3 style="background-color:#ffaaaa">${name}: 測試 ${msg} 失敗</h3>`;
      }
    });
    const monitors = this.vm.runtime.monitorBlocks._blocks;
    this.showVariableMonitor("愛心");
  }

  // 新增這個方法來顯示變數監視器
  showVariableMonitor(variableName) {
    const monitors = this.vm.runtime.monitorBlocks._blocks;
    for (let id in monitors) {
      var monitor = monitors[id];
      if (
        monitor.opcode === "data_variable" &&
        monitor.fields.VARIABLE.value === variableName
      ) {
        /*
        monitor.isMonitored = true;
        monitor.visible = true;
        monitor.x = 10; // 設定變數監視器的位置，可以根據需要調整
        monitor.y = 10;
        // 使用 monitor 的 fields 屬性
        this.vm.runtime.requestUpdateMonitor({
          id: monitor.id,
          fields: monitor.fields,
          isMonitored: monitor.isMonitored,
          visible: monitor.visible,
          x: monitor.x,
          y: monitor.y,
        });
        //*/
      }
    }
  }

  async restart() {
    this.vm.stopAll();
    this.sprites = {};
    this.loadSprite();
    this.vm.greenFlag();
  }
}
