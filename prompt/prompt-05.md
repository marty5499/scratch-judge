# judge.js
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



# index.html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scratch VM Example</title>
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
            width: 150px;
            height: 24px;
            font-size: 16px;
            margin: 2px;
        }
    </style>
</head>

<body>
    <h2><a href="https://hackmd.io/@chihchao/r1DKLad2a#Unit-1-%E6%95%85%E4%BA%8B%E7%9A%84%E9%96%8B%E7%AB%AF">EGame
            Scratch 課程規劃</a></h2>
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
        <input style='height:24px' type="text" id="projectFile" placeholder="Enter SB3 file name" value="1-1">
        <button id="loadProjectButton">讀取</button>
        <div id="btnGroup" style="display: none;">
            <button onclick="setAndLoadProject('g-01')">01 你好世界.sb3</button>
            <button onclick="setAndLoadProject('g-02')">02 問答學堂.sb3</button>
            <button onclick="setAndLoadProject('g-03')">03 環遊世界.sb3</button>
            <button onclick="setAndLoadProject('g-04')">04 收集愛心.sb3</button>
            <button onclick="setAndLoadProject('g-05')">05 魔法世界.sb3</button>
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

        window.frameRate = 60; // 初始幀率 (每秒幀數)
        const originalStep = vm.runtime._step;
        let lastTime = 0;
        
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

        function loadProject(projectFileName) {
            var script = document.createElement('script');
            script.src = `./stage/${projectFileName}.js`;
            script.onload = () => {
                fetch(`./stage/${projectFileName}.sb3`).then(response => response.arrayBuffer()).then(projectData => {
                    vm.start();
                    vm.loadProject(projectData).then(async () => {
                        var judge = new Judge(vm, window.TestCase);
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
        btnGroup.style['display'] = "";
    </script>
</body>

</html>

===
我正在寫一個程式 judge.js + index.html 使用了 Scratch-VM ，可以用來載入 .sb3檔案，
然後執行 .sb3 檔案，紀錄 .sb3檔案中每個 sprite 的物件資訊，目的是用來判斷該 .sb3檔案
是否有滿足題目要求。例如有一個角色從左側移動到右側，或角色是否有切換造型。

你先看完程式碼準備好，我要問你一些問題


###### 等AI回覆後

