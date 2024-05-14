# index.html
<body>
    <script src="./scratch-vm.js"></script>
    <script src="./scratch-storage.js"></script>
    <script src="./scratch-svg-renderer.js"></script>
    <script src="./scratch-render.js"></script>
    <script src="./judge.js"></script>

    <canvas id="test" width="480" height="360" style="width: 480px"></canvas>

    <script>
        // These variables are going to be available in the "window global" intentionally.
        // Allows you easy access to debug with `vm.greenFlag()` etc.
        window.devicePixelRatio = 1;
        var canvas = document.getElementById('test');
        var render = new ScratchRender(canvas);
        var vm = new VirtualMachine();
        var storage = new ScratchStorage();
        var mockMouse = data => vm.runtime.postIOData('mouse', {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            ...data,
        });
        vm.attachStorage(storage);
        vm.attachRenderer(render);
        vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());
        vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());

        document.addEventListener('keydown', e => {
            console.log("key:", e.key);
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

        fetch('./stage/EGame Scratch Unit 1-1.sb3').then(response => response.arrayBuffer()).then(projectData => {
            var judge = new Judge(vm);
            vm.start();
            vm.loadProject(projectData).then(async () => {
                await judge.start();
            }).catch(error => {
                console.error('Failed to load or start the project:', error);
            });
        }).catch(error => {
            console.error('Failed to fetch the .sb3 file:', error);
        });
    </script>
</body>

# judge.js
class Judge {
  constructor(vm) {
    this.vm = vm;
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
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  loadSprite() {
    this.sprites = {};
    this.vm.runtime.targets.forEach((target) => {
      if (!target.isStage) {
        this.sprites[target.sprite.name] = {
          obj: target,
          id: target.id,
          x: target.x,
          y: target.y,
        };
      }
    });
  }

  async start() {
    this.loadSprite();
    this.vm.greenFlag();
    await this.press("ArrowRight", 500);
    await this.press("ArrowLeft", 1000);
  }

  onUpdate(target) {}
}
===
上面類別是我用來透過使用 Scratch VM  ，來設定鍵盤觸發或讀取 Sprite 所有角色資訊，修改 judge 程式碼，當 Sprite 角色的資訊狀態改變(例如座標移動) ，就呼叫 onUpdate方法，提供該 target 物件的相關資訊

