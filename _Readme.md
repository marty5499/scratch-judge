開發 scratch-judge 引擎
===

# 啟動方式
>npm start

[首頁](http://localhost:3000/index.html)
[關卡解答展示](http://localhost:3000/ans.html)
[上傳答案關卡](http://localhost:3000/run.html)

[測試用canvas畫圖](http://localhost:3000/drawTest.html)
[測試檔案上傳](http://localhost:3000/upload.html)

# 程式碼說明
- 引用程式碼
    - ./scratch-vm.js scratch開源程式
    - ./scratch-storage.js scratch開源程式
    - ./scratch-svg-renderer.js scratch開源程式
    - ./scratch-render.js scratch開源程式
    - ./resemble.min.js 判斷圖片是否相同
- 開發程式碼
    - ./draw-testcase.js 關卡測試的總父類別
    - ./judge.js 慶奇開發的引擎核心
    - ./stage/ 存放每個關卡(包含繪圖關卡)的 testcase
    - ./stage_draw/ 暫存區

# 關卡父類別

# 操控 judge 物件
每個驗證關卡都會有一個 judge 物件可用來輸入按鍵、取得物件資訊等
```js
//延遲ms
await this.judge.delay(100);
//按下空白鍵
await this.judge.press(" ", 50);
//向右移動 ArrowRight、ArrowLeft...
await this.judge.press("ArrowRight", 500);
//取得所有角色的碰撞次數，返回角色物件，例如 {Cat: 0, Gobo: 1, GoboFire: 0, Dragon: 1}
this.judge.collisionCounts
//取得所有角色資訊
this.judge.sprites_id()
//取得所有角色資訊_名字作為 key
this.judge.sprites_name()
//取得所有變數資訊
this.judge.variables
```

## 角色(sprite 或 target)包含可用的屬性
抱歉，我之前提到的 `lists` 屬性在 Scratch VM 的 `target` 物件中是不正確的。實際上，Scratch VM 中的 `target` 物件並不包含 `lists` 屬性。

在 Scratch 中，列表（lists）是由變數管理的，且列表的範疇是全局或角色範圍內，而不是直接屬於 `target` 物件的一部分。因此，`target` 本身沒有 `lists` 屬性。所有列表操作都是通過變數機制實現的，而不是直接在 `target` 物件中進行管理。

### 正確的 `target` 物件屬性列表（去除錯誤屬性）
1. **`id`**: 每個 `target` 的唯一標識符，用於區分不同的角色或背景。
2. **`name`**: 角色或背景的名稱，顯示在 Scratch 編輯器中。
3. **`isStage`**: 布林值，表示該 `target` 是否為舞台（`true` 表示是舞台，`false` 表示是角色）。
4. **`isOriginal`**: 布林值，表示該 `target` 是否為原始角色（`true` 表示原始角色，`false` 表示分身）。
5. **`visible`**: 布林值，表示該角色是否可見（`true` 表示可見，`false` 表示隱藏）。
6. **`x`**: 角色的當前水平位置（x 座標），通常是數值，控制角色在舞台上的水平位置。
7. **`y`**: 角色的當前垂直位置（y 座標），通常是數值，控制角色在舞台上的垂直位置。
8. **`direction`**: 角色面對的方向，數值形式，表示角色當前的朝向（例如 0 表示向上，90 表示向右）。
9. **`size`**: 角色的大小比例，數值形式，通常是百分比（例如 100 表示原始大小）。
10. **`rotationStyle`**: 角色的旋轉樣式，可以是以下值之一：
    - `"all around"`：允許角色自由旋轉。
    - `"left-right"`：角色只能左右翻轉。
    - `"don't rotate"`：角色不旋轉。
11. **`currentCostume`**: 當前顯示的造型的索引或名稱，表示角色當前使用的造型。
12. **`costumes`**: 包含角色所有造型的列表，每個造型包括名稱、圖片數據等詳細信息。
13. **`volume`**: 角色的音量級別，數值形式，通常是 0 到 100 之間，控制角色的音量大小。
14. **`effects`**: 角色的視覺效果設置，包括透明度、顏色改變等效果。
15. **`sounds`**: 角色的所有聲音列表，每個聲音包括名稱、音頻數據等詳細信息。
16. **`blocks`**: 與該角色相關的積木腳本的列表，描述角色的行為。
17. **`variables`**: 角色特有的變數表，用於存儲角色私有的數據。


# 更新到 Egame
```sh
# or build.sh 產生 image 並且 push to nest.webduino.tw/scratch-judge:latest
> ./build_x86.sh 
>egame-stg  # 先進入 egame-stg 測試機
mingzeke@py-stg-master:~$ scratch-test # 再進入Scratch測試機
>k9s # 刪除 scratch-judge container 就會重新抓 image 重啟新版本
```