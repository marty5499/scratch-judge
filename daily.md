# 05/13

## 3-1 關卡大問題
- 使用者建立的分身在 target.sprite.clones 陣列中
```js
var sprite = this.judge.sprites[key];
sprite.target.sprite.clones[1].x // 0:分身0 , 1:分身1
```
- 如果使用者建立多個分身，會影響判斷
