開發 scratch-judge 引擎
===

專案清單

- scratch-gui        Scratch 積木工具 (Egame版本)
   - 修改 scratch blockly 程式，設計 Egame 的積木
   - npm run build 產生 scratch-gui 網頁程式

- scratch-web        Scratch 積木工具 + nodeJS 伺服器 (提供後端存取)
   - 執行 ./dockerBuild.sh 會複製 scratch-gui/build 到 public 資料夾 (覆蓋)

- scratch-judge      Scratch 評測引擎

## 啟動方式
```sh
# 評測引擎測試 (scratch-judge)
>npm start

# scratch-web 積木工具 ( SCRATCH-WEB)
# /kingkit.codes/2024/scratch/scratch-web
>npm webServer
```

## 更新到 Egame
```sh
# or build.sh 產生 image 並且 push to nest.webduino.tw/scratch-judge:latest
> ./build_x86.sh 
>egame-stg  # 先進入 egame-stg 測試機
mingzeke@py-stg-master:~$ scratch-test # 再進入Scratch測試機
>k9s # 刪除 scratch-judge container 就會重新抓 image 重啟新版本
```


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
// 取得時間軸的事件觸發
// 1. 角色屬性 x,y,direction,currentCostume,visible,isOriginal
// 2. 建立分身、刪除分身
// 3. 碰撞
// 4. 變數改變值
this.judge.timeline
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



# judge.js 程式說明

這段程式碼主要定義了一個名為 `Judge` 的類別，以及一個輔助的 `Timeline` 類別，用於對 Scratch 專案進行自動化測試和評估。

---

### **Timeline 類別**

`Timeline` 類別用於記錄事件的時間線。它提供以下方法：

- `push(eventName, name, value)`：將事件名稱、屬性名稱和值添加到時間線中。
- `pushObj(eventName, info)`：將包含事件資訊的物件添加到時間線中。
- `info()`：返回整個時間線資訊。
- `stringify()`：將時間線轉換為 JSON 字串。

---

### **Judge 類別**

`Judge` 類別的主要功能是監控和控制 Scratch 專案的執行，模擬使用者的操作，並記錄專案執行過程中的各種事件和狀態變化。

#### **主要屬性**

- `canvas`：畫布元素，用於顯示 Scratch 專案。
- `vm`：Scratch 虛擬機實例，負責執行 Scratch 程式。
- `fixedRandom`：固定的隨機值，用於控制隨機性。
- `scriptSrc`：腳本來源，用於載入特定的測試腳本。
- `TestCase`：測試用例類別，用於定義測試邏輯。
- `clones`：記錄分身的創建和刪除狀態。
- `sprites`：存儲所有角色的資訊和狀態。
- `variables`：存儲所有變數的資訊和變化記錄。
- `collisions`：記錄已發生的碰撞事件。
- `collisionCounts`：統計每個角色發生碰撞的次數。
- `timeline`：`Timeline` 類別的實例，用於記錄事件時間線。

#### **主要方法**

1. **事件模擬**

   - `async clickSprite(target)`：模擬在指定的角色上進行滑鼠點擊操作。
   - `async press(key, ms)`：模擬按下指定的鍵盤按鍵一段時間。
   - `enterInput(text)`：模擬使用者在輸入框中輸入文字。

2. **狀態監控與記錄**

   - `loadSprite()`：載入所有角色，記錄其初始狀態，並為每個角色註冊監控器。
   - `monitorClonesUpdate(target)`：監控角色的分身創建和刪除事件。
   - `onCloneState(target, action)`：當分身被創建或刪除時，更新記錄和時間線。
   - `registerObservers(target)`：為角色的特定屬性註冊監控，以監控其變化。
   - `monitorProperty(target, propName, isCoordinate = false)`：監控角色的特定屬性，當屬性變化時觸發 `onUpdate`。
   - `onUpdate(sprite, propName, newValue)`：當角色的屬性變化時，更新記錄，並檢測與其他角色的碰撞。

3. **變數監控**

   - `monitorVariableChanges()`：監控舞台上所有變數的變化，並記錄變化過程。

4. **碰撞檢測**

   - `checkCollision(sprite1, sprite2)`：檢測兩個角色之間是否發生碰撞。
   - `collisionTimes(name)`：返回指定角色發生碰撞的次數。

5. **使用者互動處理**

   - `registerQuestionHandler()`：註冊處理 Scratch 中的提問事件，模擬使用者輸入。

6. **測試流程控制**

   - `async start()`：開始測試流程，初始化環境，執行測試用例。
   - `async restart()`：重置測試環境，重新開始測試。
   - `checkIfExecutionComplete(self)`：檢查專案執行是否完成，完成後調用測試用例的 `onCompleted` 方法。

7. **輔助方法**

   - `delay(ms)`：延遲指定的時間。
   - `sprites_id()`：返回以角色 ID 為鍵的角色資訊。
   - `sprites_name()`：返回以角色名稱為鍵的角色資訊。

---

### **整體流程**

1. **初始化**：建立 `Judge` 實例時，會初始化各種屬性，並開始監控變數的變化。

2. **載入角色**：通過 `loadSprite()` 方法，載入所有角色並為其註冊屬性監控器。

3. **監控角色和變數變化**：當角色的屬性（如位置、方向、造型等）或變數的值發生變化時，會被相應的監控器捕獲，並記錄在時間線中。

4. **模擬使用者操作**：通過方法如 `clickSprite()`、`press()`、`enterInput()`，模擬使用者的滑鼠點擊、鍵盤按鍵和文字輸入等操作。

5. **碰撞檢測**：在角色位置變化時，通過 `checkCollision()` 方法檢測是否與其他角色發生碰撞，並記錄碰撞事件。

6. **執行測試用例**：`start()` 方法開始執行測試用例，並在測試完成後檢查執行結果。

7. **結果記錄與輸出**：所有事件和狀態變化都被記錄在 `timeline` 中，可供後續分析和輸出。

---

### **應用場景**

這段程式碼適用於需要對 Scratch 專案進行自動化測試的情況。它可以模擬使用者的操作，監控專案內部的狀態變化，並對特定的事件（如變數變化、角色碰撞、分身創建等）進行記錄和處理。這對於教育、遊戲測試、自動化評估等場景非常有用。

---

### **總結**

通過定義 `Judge` 和 `Timeline` 類別，程式碼實現了對 Scratch 專案的全面監控和測試功能。它不僅能夠模擬使用者的各種操作，還能夠深入監控專案內部的狀態和事件，為自動化測試和評估提供了強大的支持。