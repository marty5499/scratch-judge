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
    setInterval(() => this.checkForUpdates(), 50); // check every 100 milliseconds
    var ele = document.getElementById("result");
    await this.testcase.start(function (name, result, msg) {
      if (result) {
        ele.innerHTML += `<h3 style="background-color:#aaffaa">${name}: 測試 ${msg}  成功</h3>`;  
      } else {
        ele.innerHTML += `<h3 style="background-color:#ffaaaa">${name}: 測試 ${msg}  失敗</h3>`;  
      }
      
    });
  }

  onUpdate(sprite) {
    sprite["records"].push(sprite.target.x);
  }
}

# index.html
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
        width: 100px;
        height: 24px;
        font-size: 16px;
        margin: 2px;
    }
</style>

<body>
    <h2><a href="https://hackmd.io/@chihchao/r1DKLad2a#Unit-1-%E6%95%85%E4%BA%8B%E7%9A%84%E9%96%8B%E7%AB%AF">EGame Scratch 課程規劃</a>
    </h2>
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
        <div>
            <button onclick="setAndLoadProject('1-1')">1-1</button>
            <button onclick="setAndLoadProject('1-2')">1-2</button>
            <button onclick="setAndLoadProject('1-3')">1-3</button>
            <button onclick="setAndLoadProject('1-4')">1-4</button>
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

        function loadProject(projectFileName) {
            var script = document.createElement('script');
            script.src = `./stage/${projectFileName}.js`;
            script.onload = () => {
                fetch(`./stage/${projectFileName}.sb3`).then(response => response.arrayBuffer()).then(projectData => {
                    var judge = new Judge(vm, window.TestCase);
                    vm.start();
                    vm.loadProject(projectData).then(async () => {
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
    </script>
</body>


===
我目前 judge 使用 checkForUpdates() 每 50ms 偵測 sprite 資訊有沒有變化，這樣效率很差，
如何改寫成當 sprite 資訊有變化主動通知我?