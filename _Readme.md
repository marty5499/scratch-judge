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



# 更新到 Egame
```sh
# or build.sh 產生 image 並且 push to nest.webduino.tw/scratch-judge:latest
> ./build_x86.sh 
>egame-stg  # 先進入 egame-stg 測試機
mingzeke@py-stg-master:~$ scratch-test # 再進入Scratch測試機
>k9s # 刪除 scratch-judge container 就會重新抓 image 重啟新版本
```