Overview
===
## 程式清單
./index.html    scratch-judge 起始畫面
./jduge.js      評測引擎
./stage/*       所有關卡
./prompt/*      AI協作程式開發

## judge.js 功能
- target 碰撞偵測
- stage 變數異動偵測
- 輸入框輸入文字的功能
- restart() 關卡進行多個測試案例


## index.html 功能
- 偵測滑鼠事件
- 偵測鍵盤輸入
- 
## 目前已知問題
- 變數沒有顯示
- 場景切換不一定是廣播，是否變成題目要求?


## 筆的事件
在 Scratch 中，與筆相關的事件和指令主要包括以下幾種：

清除筆跡 (clear):

清除所有筆跡。
下筆 (pen down):

開始畫筆。
停筆 (pen up):

停止畫筆。
設置筆的顏色 (set pen color to [color]):

設置畫筆的顏色。
改變筆的顏色 (change pen color by [amount]):

改變畫筆的顏色。
設置筆的粗細 (set pen size to [size]):

設置畫筆的粗細。
改變筆的粗細 (change pen size by [amount]):

改變畫筆的粗細。
設置筆的陰影 (set pen shade to [shade]):

設置畫筆的陰影。
改變筆的陰影 (change pen shade by [amount]):

改變畫筆的陰影。
設置筆的透明度 (set pen transparency to [transparency]):

設置畫筆的透明度。
改變筆的透明度 (change pen transparency by [amount]):

改變畫筆的透明度。
這些指令涵蓋了筆的基本操作，包括筆跡的清除、開始與停止畫筆、設置和改變筆的顏色、粗細、陰影和透明度等屬性。在實現這些指令時，你可以相應地擴展 judge.js 中的 registerPenHandlers 方法，對這些事件進行監聽和記錄。