# 08/05

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
