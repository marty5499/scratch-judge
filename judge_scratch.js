import puppeteer from 'puppeteer';

async function judgeScratch() {
    try {
        // 啟動瀏覽器，設定 headless: false 以便看到運行狀態
        const browser = await puppeteer.launch({
            headless: false,  // 關閉 headless 模式，可以看到瀏覽器運行
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // 建立新頁面
        const page = await browser.newPage();

        // 設定頁面視窗大小
        await page.setViewport({
            width: 1280,
            height: 720
        });

        // 載入評判頁面
        const url = 'http://localhost:4000/judge.html?url=http://localhost:4000/stage/1-2.sb3';
        await page.goto(url, {
            waitUntil: 'networkidle0',  // 等待網路請求完成
            timeout: 60000  // 60秒超時
        });

        // 等待 Scratch 專案載入完成
        await page.waitForSelector('#scratch-stage', {
            timeout: 30000
        });

        // 等待評判結果
        const result = await page.evaluate(() => {
            return new Promise((resolve) => {
                // 監聽來自頁面的訊息
                window.addEventListener('message', (event) => {
                    if (event.data.type === 'judgeResult') {
                        resolve(event.data.result);
                    }
                });
            });
        });

        console.log('評判結果:', result);

        // 關閉瀏覽器
        await browser.close();

    } catch (error) {
        console.error('執���過程發生錯誤:', error);
        process.exit(1);
    }
}

// 執行評判
judgeScratch(); 