# judge.js
class Judge {
  constructor(canvas, vm, TestCase) {
    this.canvas = canvas;
    this.vm = vm;
    this.TestCase = TestCase;
    this.sprites = {};
    this.variables = {};
    this.collisions = new Set(); // 用於記錄已發生的碰撞
    this.collisionCounts = {}; // 用於紀錄每個物件的碰撞次數
    this.penEvents = []; // 用於記錄筆事件
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

  registerPenHandlers() {
    const self = this;
    const originalStep = this.vm.runtime._step;
    this.vm.runtime._step = function (time) {
      for (const target of self.vm.runtime.targets) {
        if (target.isStage) continue;
        const penAttributes = target.drawable.penAttributes;
        if (penAttributes) {
          if (penAttributes.penDown) {
            if (!self.penEvents.includes('penDown')) {
              self.penEvents.push({ event: 'penDown', timestamp: Date.now() });
              console.log('Pen down event');
            }
          } else {
            if (!self.penEvents.includes('penUp')) {
              self.penEvents.push({ event: 'penUp', timestamp: Date.now() });
              console.log('Pen up event');
            }
          }
          if (penAttributes.color) {
            self.penEvents.push({ event: 'setPenColor', timestamp: Date.now(), color: penAttributes.color });
            console.log('Set pen color event', penAttributes.color);
          }
          if (penAttributes.size) {
            self.penEvents.push({ event: 'setPenSize', timestamp: Date.now(), size: penAttributes.size });
            console.log('Set pen size event', penAttributes.size);
          }
        }
      }
      originalStep.call(self.vm.runtime, time);
    };
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
    //this.registerPenHandlers(); // 新增這行來註冊筆事件處理器
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
    this.penEvents = []; // 重置筆事件
    this.loadSprite();
    this.vm.greenFlag();
  }
}


# ans.html

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scratch-Judge</title>
    <style>
        #main {
            display: flex;
            align-items: start;
            justify-content: space-around;
        }

        #test {
            flex: 0 0 auto;
            margin-right: 20px;
            border: 3px solid #ffa500;
        }

        #list {
            flex: 1 1 auto;
            background-color: #f4f4f4;
            padding: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        button {
            width: 120px;
            height: 24px;
            font-size: 16px;
            margin: 2px;
        }
    </style>
</head>

<body>
    <h2>關卡解答</h2>
    <div id="container">
        <div id="main">
            <canvas id="test" width="640" height="480" style="width: 480px;"></canvas>
            <div id="list">
                <div>
                    <h2>測試結果</h2>
                </div>
                <div id="result"></div>
            </div>
        </div>
        <div id="testcase" style="margin:10px">
            <input style='height:24px' type="text" id="projectFile" placeholder="Enter SB3 file name" value="1-1">
            <button id="loadProjectButton">讀取</button>
            <button id="restartProjectButton" style="display:none;">重新執行</button>
            <div id="btnGroup" style="display: none;">
                <button onclick="setAndLoadProject('g-01')">01 你好世界</button>
                <button onclick="setAndLoadProject('g-02')">02 問答學堂</button>
                <button onclick="setAndLoadProject('g-03')">03 環遊世界</button>
                <button onclick="setAndLoadProject('g-04')">04 收集愛心</button>
                <button onclick="setAndLoadProject('g-05')">05 魔法世界</button>
                <br>
                <button onclick="setAndLoadProject('1-1')">1-1</button>
                <button onclick="setAndLoadProject('1-2')">1-2</button>
                <button onclick="setAndLoadProject('1-3')">1-3</button>
                <button onclick="setAndLoadProject('1-4')">1-4</button>
                <br>
                <button onclick="setAndLoadProject('2-1')">2-1</button>
                <button onclick="setAndLoadProject('2-2')">2-2</button>
                <button onclick="setAndLoadProject('2-3')">2-3</button>
                <button onclick="setAndLoadProject('2-4')">2-4</button>
                <br>
                <button onclick="setAndLoadProject('3-1')">3-1</button>
                <button onclick="setAndLoadProject('3-2')">3-2</button>
                <button onclick="setAndLoadProject('3-3')">3-3</button>
                <button onclick="setAndLoadProject('3-4')">3-4</button>
                <br>
                <button onclick="setAndLoadProject('draw-01')">達克_函數</button>
            </div>
        </div>
    </div>
    <script src="./scratch-vm.js"></script>
    <script src="./scratch-storage.js"></script>
    <script src="./scratch-svg-renderer.js"></script>
    <script src="./scratch-render.js"></script>
    <script src="./judge.js"></script>
    <script>
        window.devicePixelRatio = 1;
        var canvas = document.getElementById('test');
        var render = new ScratchRender(canvas);
        var vm = new VirtualMachine();
        var storage = new ScratchStorage();
        vm.attachStorage(storage);
        vm.attachRenderer(render);
        vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());
        vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());

        let lastTime = 0;
        window.frameRate = 60; // 初始幀率 (每秒幀數)
        const originalStep = vm.runtime._step;
        window.runSpeed = 100.0 / window.frameRate;

        function setFrameRate(newFrameRate) {
            window.frameRate = newFrameRate;
            window.runSpeed = 100.0 / window.frameRate;
        }

        vm.runtime._step = function (time) {
            if (time - lastTime >= 1000 / window.frameRate) {
                lastTime = time;
                originalStep.call(vm.runtime, time);
            }
            requestAnimationFrame(vm.runtime._step.bind(vm.runtime));
        };

        document.addEventListener('keydown', e => {
            vm.postIOData('keyboard', {
                key: e.key,
                isDown: true
            });
        });

        document.addEventListener('keyup', e => {
            vm.postIOData('keyboard', {
                key: e.key,
                isDown: false
            });
        });

        function getMousePosition(event, rect) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            return { x, y };
        }

        canvas.addEventListener('mousedown', e => {
            const rect = canvas.getBoundingClientRect();
            const { x, y } = getMousePosition(e, rect);
            vm.postIOData('mouse', {
                x: x,
                y: y,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                isDown: true
            });
        });

        canvas.addEventListener('mouseup', e => {
            const rect = canvas.getBoundingClientRect();
            const { x, y } = getMousePosition(e, rect);
            vm.postIOData('mouse', {
                x: x,
                y: y,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                isDown: false
            });
        });

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            const { x, y } = getMousePosition(e, rect);
            vm.postIOData('mouse', {
                x: x,
                y: y,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                isDown: e.buttons === 1 // 如果按下滑鼠左鍵
            });
        });

        function loadProject(projectFileName) {
            var script = document.createElement('script');
            script.src = `./stage/${projectFileName}.js`;
            script.onload = () => {
                fetch(`./stage/${projectFileName}.sb3`).then(response => response.arrayBuffer()).then(projectData => {
                    vm.start();
                    vm.loadProject(projectData).then(async () => {
                        console.log("Project loaded...");
                        var judge = new Judge(canvas, vm, window.TestCase);
                        window.judge = judge; // Save judge instance for later use
                        document.getElementById('restartProjectButton').style.display = '';
                        await judge.start();
                    }).catch(error => {
                        console.error('Failed to load or start the project:', error);
                    });
                }).catch(error => {
                    console.error('Failed to fetch the .sb3 file:', error);
                });
            };
            script.onerror = () => {
                console.error('Failed to load the JS file:', error);
            };
            document.head.appendChild(script);
        }

        function setAndLoadProject(projectFileName) {
            result.innerHTML = '';
            document.getElementById('projectFile').value = projectFileName;
            loadProject(projectFileName);
        }

        document.getElementById('loadProjectButton').addEventListener('click', () => {
            var projectFileName = document.getElementById('projectFile').value;
            loadProject(projectFileName);
        });

        document.getElementById('projectFile').addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                var projectFileName = document.getElementById('projectFile').value;
                loadProject(projectFileName);
            }
        });

        document.getElementById('restartProjectButton').addEventListener('click', () => {
            result.innerHTML = '';
            window.judge.restart();
        });

        btnGroup.style['display'] = "";
    </script>
</body>

</html>
===
我正在寫一個程式 judge.js + index.html 使用了 Scratch-VM ，可以用來載入 .sb3檔案，
然後執行 .sb3 檔案，紀錄 .sb3檔案中每個 sprite 的物件資訊，目的是用來判斷該 .sb3檔案
是否有滿足題目要求。例如有一個角色從左側移動到右側，或角色是否有切換造型。

你先看完程式碼準備好，我要問你一些問題