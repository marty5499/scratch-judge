class Runner {
  constructor(workspace) {
    this.workspace = workspace; // Reference to the Blockly workspace
    this.targetBlock = null;
  }

  /**
   * 選擇指定 data-id 的積木，並移動到目標位置。
   * @param {string} blockId - 要拖動的積木的 data-id。
   * @param {number} durationSeconds - 拖動的持續時間（秒）。
   * @param {number} targetX - 目標 X 座標。
   * @param {number} targetY - 目標 Y 座標。
   * @returns {Promise<Block>} - 回傳拖動後的 Block 實例。
   */
  async drag(blockId, durationSeconds = 0.5, targetX = null, targetY = null) {
    // 添加延遲
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 重置 targetBlock
    this.targetBlock = null;
    
    // 選擇目標積木
    const flyoutBlocks = document.querySelectorAll(
      ".blocklyFlyout .blocklyBlockCanvas > g"
    );
    console.log("尋找積木:", blockId);
    
    let targetBlock = null;
    for (let block of flyoutBlocks) {
      const dataId = block.getAttribute("data-id");
      if (dataId === blockId) {
        targetBlock = block;
        break;
      }
    }

    if (!targetBlock) {
      throw new Error(`未找到指定的積木: ${blockId}`);
    }

    // 保存目標積木的資訊
    this.targetBlock = targetBlock;
    
    // 如果沒有提供座標，先移動到工作區中心
    if (targetX === null || targetY === null) {
      const workspaceDiv = document.querySelector('.blocklyWorkspace');
      const rect = workspaceDiv.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }
    
    // 移動積木並回傳 Block 實例
    const blockInstance = await this.moveTo(durationSeconds, targetX, targetY);
    
    // 保存最後拖動的積木實例
    this.lastDraggedBlock = blockInstance;
    
    // 執行完成後重置
    this.targetBlock = null;
    
    return blockInstance;
  }

  async attach(durationSeconds, targetBlock) {
    console.log("開始附加積木:", {
        lastDraggedBlock: this.lastDraggedBlock,
        targetBlock: targetBlock
    });
    
    if (!this.lastDraggedBlock) {
        throw new Error("沒有可用的積木來附加");
    }

    // 使用最後拖動的積木的元素
    this.targetBlock = this.lastDraggedBlock.getElement();
    
    // 直接根據目標積木的位置和高度計算附加位置
    const targetRect = targetBlock.blockElement.getBoundingClientRect();
    
    // 計算目標位置：目標積木的 X 座標和 Y 座標 + 高度
    const targetX = targetRect.left + (targetRect.width / 2);
    const targetY = targetRect.bottom + 10; // 在底部加上一點間距
    
    console.log("附加位置:", { targetX, targetY });
    
    try {
        // 移動到計算出的位置
        const result = await this.moveTo(durationSeconds, targetX, targetY);
        
        // 等待一下確保連接完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 清除暫存的積木引用
        this.targetBlock = null;
        
        return result;
    } catch (error) {
        console.error("附加積木時發生錯誤:", error);
        throw error;
    }
  }

  /**
   * Drags the selected block to the specified (x, y) coordinates over a given duration.
   * @param {number} durationSeconds - Duration of the drag in seconds.
   * @param {number} targetX - Target X coordinate in the workspace.
   * @param {number} targetY - Target Y coordinate in the workspace.
   * @returns {Promise<Block>} - Promise that resolves to the dragged Block object.
   */
  moveTo(durationSeconds, targetX, targetY) {
    this.self = this;
    return new Promise((resolve, reject) => {
      if (!this.targetBlock) {
        return reject(new Error("未選擇任何積木進行拖拉"));
      }
      
      // 記錄移動前的所有積木 ID
      const initialBlockIds = new Set(
        this.workspace.getAllBlocks(false).map(block => block.id)
      );
      console.log("移動前積木 IDs:", initialBlockIds);
      
      console.log("開始移動積木:", {
        targetBlock: this.targetBlock,
        duration: durationSeconds,
        targetX,
        targetY
      });
      
      // 獲取積木的當前位置
      const blockRect = this.targetBlock.getBoundingClientRect();

      // 計算起始位置（積木中心）
      const startX = blockRect.left + blockRect.width / 2;
      const startY = blockRect.top + blockRect.height / 2;

      // 目標位置
      const endX = targetX;
      const endY = targetY;

      // 觸發 mousedown 事件
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: startX,
        clientY: startY,
        bubbles: true,
        cancelable: true,
      });
      this.targetBlock.dispatchEvent(mouseDownEvent);

      // 動畫參數
      const duration = durationSeconds * 1000; // 轉換為毫秒
      const frameRate = 60; // 每秒幀數
      const totalFrames = (duration / 1000) * frameRate;
      let currentFrame = 0;

      // 每幀位移
      const deltaX = (endX - startX) / totalFrames;
      const deltaY = (endY - startY) / totalFrames;

      // 動畫函數
      const animateDrag = () => {
        if (currentFrame <= totalFrames) {
          // 當前位置
          const currentX = startX + deltaX * currentFrame;
          const currentY = startY + deltaY * currentFrame;

          // 觸發 mousemove 事件
          const mouseMoveEvent = new MouseEvent("mousemove", {
            clientX: currentX,
            clientY: currentY,
            bubbles: true,
            cancelable: true,
          });
          document.dispatchEvent(mouseMoveEvent);

          currentFrame++;
          requestAnimationFrame(animateDrag);
        } else {
          // 觸發 mouseup 事件以完成拖拉
          const mouseUpEvent = new MouseEvent("mouseup", {
            clientX: endX,
            clientY: endY,
            bubbles: true,
            cancelable: true,
          });
          document.dispatchEvent(mouseUpEvent);

          // 修改 setTimeout 部分
          setTimeout(() => {
            const currentBlocks = this.workspace.getAllBlocks(false);
            console.log("當前所有積木:", currentBlocks);
            
            // 尋找新增的積木（ID 不在初始列表中的積木）
            const newBlocks = currentBlocks.filter(block => !initialBlockIds.has(block.id));
            console.log("找到的新積木:", newBlocks);
            
            if (newBlocks.length > 0) {
              // 使用最後一個新增的積木
              const newBlock = newBlocks[newBlocks.length - 1];
              console.log("使用新積木:", newBlock.id);
              const blockElement = newBlock.getSvgRoot();
              const blockInstance = new Block(blockElement, newBlock);
              resolve(blockInstance);
              return; // 確保在找到新積木後立即返回，不執行後續代碼
            }
            
            // 如果沒有找到新積木，但積木總數增加了，使用最後一個積木
            if (currentBlocks.length > initialBlockIds.size) {
              console.log("使用最後一個積木");
              const lastBlock = currentBlocks[currentBlocks.length - 1];
              const blockElement = lastBlock.getSvgRoot();
              const blockInstance = new Block(blockElement, lastBlock);
              resolve(blockInstance);
              return; // 確保在解析後立即返回
            }
            
            // 只有在確實需要重試時才執行重試邏輯
            console.log("需要重試：沒有新增積木");
            let retryCount = 0;
            const maxRetries = 3;
            
            const retry = () => {
              if (retryCount >= maxRetries) {
                reject(new Error("超過最大重試次數"));
                return;
              }
              
              retryCount++;
              console.log(`第 ${retryCount} 次重試`);
              
              if (!this.targetBlock) {
                reject(new Error("找不到目標積木"));
                return;
              }
              
              setTimeout(() => {
                this.self.moveTo(durationSeconds, targetX, targetY)
                  .then(blockInstance => resolve(blockInstance))
                  .catch(err => {
                    if (retryCount < maxRetries) {
                      retry();
                    } else {
                      reject(err);
                    }
                  });
              }, 500);
            };
            
            retry();
          }, 1000);
        }
      };

      // 開始動畫
      animateDrag();
    });
  }
}

/**
 * Represents a Blockly Block with utility methods to get its properties.
 */
class Block {
  /**
   * @param {SVGElement} blockElement - The SVG element representing the block in the DOM.
   * @param {Blockly.Block} blockInstance - The Blockly Block instance.
   */
  constructor(blockElement, blockInstance) {
    this.blockElement = blockElement;
    this.blockInstance = blockInstance;
  }

  /**
   * Gets the current X coordinate of the block.
   * @returns {number} - The X coordinate.
   */
  getX() {
    const rect = this.blockElement.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  /**
   * Gets the current Y coordinate of the block.
   * @returns {number} - The Y coordinate.
   */
  getY() {
    const rect = this.blockElement.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }

  /**
   * Gets the width of the block.
   * @returns {number} - The width in pixels.
   */
  getWidth() {
    const rect = this.blockElement.getBoundingClientRect();
    return rect.width;
  }

  /**
   * Gets the height of the block.
   * @returns {number} - The height in pixels.
   */
  getHeight() {
    const rect = this.blockElement.getBoundingClientRect();
    return rect.height;
  }

  /**
   * Gets the data-id of the block.
   * @returns {string|null} - The data-id attribute or null if not found.
   */
  getId() {
    if (this.blockElement) {
      return this.blockElement.getAttribute("data-id");
    }
    return null;
  }

  getElement() {
    return this.blockElement;
  }

  /**
   * (Optional) Gets the Blockly internal ID of the block.
   * Requires access to the Blockly.Block instance.
   * @returns {string|null} - The Blockly block ID or null if not available.
   */
  getBlocklyId() {
    if (this.blockInstance) {
      return this.blockInstance.id;
    }
    return null;
  }

  /**
   * 獲取積木的父積木
   * @returns {Blockly.Block|null}
   */
  getParent() {
    return this.blockInstance.getParent();
  }

  /**
   * 獲取積木的下一個連接點
   * @returns {Blockly.Connection|null}
   */
  getNextConnection() {
    return this.blockInstance.nextConnection;
  }

  /**
   * 獲取積木的上一個連接點
   * @returns {Blockly.Connection|null}
   */
  getPreviousConnection() {
    return this.blockInstance.previousConnection;
  }
}

// 使用範例
(async () => {
    const workspace = Blockly.getMainWorkspace();
    const run = new Runner(workspace);

    try {
        // 拖動第一個積木（重複積木）
        console.log("開始拖動第一個積木 (重複積木)");
        const block1 = await run.drag("control_repeat", 0.5, 400, 150);
        console.log("第一個積木拖動完成:", block1);
        
        // 等待第一個積木就位
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 拖動第二個積木（移動積木）
        console.log("開始拖動第二個積木 (移動積木)");
        const block2 = await run.drag("motion_movesteps", 0.5, 400, 200);
        console.log("第二個積木拖動完成:", block2);
        
        // 等待第二個積木就位
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 將第二個積木附加到第一個積木
        console.log("開始將移動積木附加到重複積木");
        await run.attach(0.5, block1);
        
    } catch (error) {
        console.error("執行過程發生錯誤:", error);
    }
})();
