# 06/05

## 規格書5關卡

**增加功能**
- judge.js 增加輸入框輸入文字的功能
- judge.js 增加 restart() 功能
- 完成一個測試案例後，要重啟遊戲進行另一個測試案例測試


# 05/13

## 3-1 關卡大問題
- 使用者建立的分身在 target.sprite.clones 陣列中
```js
var sprite = this.judge.sprites[key];
sprite.target.sprite.clones[1].x // 0:分身0 , 1:分身1
```
- 如果使用者建立多個分身，會影響判斷
