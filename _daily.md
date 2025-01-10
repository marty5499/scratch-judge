待辦事項

- 下下次：測試 “人話”過關條件 → AI分析互動規則 → 產生 → 正向表列偵測條件
- 優化 判斷精準度

# 12/20
完成闖關流程
載入指定關卡 (預設角色、圖片、初始積木組)
使用者完成關卡要求後，按下 [送出]
後端評測引擎進行評測
回傳評測結果




# 11/08
- 支援 音效、廣播機制
- scratch 工具加上popup dialog 顯示
- 工具列調整
- 背包功能改成過關條件說明 
- 提供 出題準則規範 - 正向表列偵測條件

# 11/04
- 支援廣播:測試 g-03關卡 event.eventName === "broadcast" ok

# 11/01
- 支援音效:測試 g-03關卡 event.eventName === "sound_play" ok

# 09/02 繪圖關卡增加底圖描邊解答
- canvas疊上一張圖片設定透明度，並且修改 draw-testcase.js會放上解答圖片

# 08/05 完成四個畫圖關卡的驗證
- 畫圖關卡應該沒有多個 testcase ，直接在 sb3執行結束後進行判斷是否和關卡名稱.png圖片相同
- judge.js增加判斷sb3檔案是否執行完成，執行完成會呼叫 onCompleted()方法
- 解決上傳中文檔名亂碼問題
- 確認 run.sh 可以上傳 .sb3 檔案進行驗證 大雪花(三)、大雪花(四) 相反可以判斷出來
- 網頁搬到 public 目錄下
- 高互動關卡繼承 RootTestCase , 有基本的 onCompleted() 方法

# 06/06 規格書5關卡
**增加功能**
- index.html 增加滑鼠移動事件 (沒測試平板上有沒有問題)
- judge.js 取得 target物件 (Stage) 裏面的圖片，解決 g-03 關卡問題
- target 碰撞偵測
- stage 變數異動偵測
- 
**查找問題**
- 變數沒有顯示
- 

# 06/05 規格書5關卡
**增加功能**
- judge.js 增加輸入框輸入文字的功能
- judge.js 增加 restart() 功能
- index.html 增加 滑鼠事件
- 完成一個測試案例後，要重啟遊戲進行另一個測試案例測試
- 場景切換不一定是廣播，是否變成題目要求?

# 05/13
## 3-1 關卡大問題
- 使用者建立的分身在 target.sprite.clones 陣列中
```js
var sprite = this.judge.sprites[key];
sprite.target.sprite.clones[1].x // 0:分身0 , 1:分身1
```
- 如果使用者建立多個分身，會影響判斷
