class Runner {
  constructor(workspace) {
    this.workspace = workspace; // Reference to the Blockly workspace
    this.targetBlock = null;
  }

  /**
   * Selects the block with the specified data-id from the flyout.
   * @param {string} blockId - The data-id of the block to drag.
   * @returns {Runner} - Returns the Runner instance for chaining.
   */
  drag(blockId) {
    // Select all flyout blocks
    const flyoutBlocks = document.querySelectorAll(
      ".blocklyFlyout .blocklyBlockCanvas > g"
    );

    // Find the target block by data-id
    for (let i = 0; i < flyoutBlocks.length; i++) {
      const block = flyoutBlocks[i];
      if (block.getAttribute("data-id") === blockId) {
        this.targetBlock = block;
        break;
      }
    }

    if (!this.targetBlock) {
      console.log("未找到指定的積木");
    }

    return this;
  }

  attach(durationSeconds, block) {
    return this.moveTo(
      durationSeconds,
      block.getX() + block.getWidth() / 2,
      block.getY() + 100
    );
  }

  inside(durationSeconds, block) {
    return this.moveTo(
      durationSeconds,
      block.getX() + block.getWidth() / 2,
      block.getY() + 50
    );
  }

  /**
   * Drags the selected block to the specified (x, y) coordinates over a given duration.
   * @param {number} durationSeconds - Duration of the drag in seconds.
   * @param {number} targetX - Target X coordinate in the workspace.
   * @param {number} targetY - Target Y coordinate in the workspace.
   * @returns {Promise<Block>} - Promise that resolves to the dragged Block object.
   */
  moveTo(durationSeconds, targetX, targetY) {
    return new Promise((resolve, reject) => {
      if (!this.targetBlock) {
        return reject(new Error("未選擇任何積木進行拖拉"));
      }

      // Get the block's current position
      const blockRect = this.targetBlock.getBoundingClientRect();

      // Calculate the starting position (center of the block)
      const startX = blockRect.left + blockRect.width / 2;
      const startY = blockRect.top + blockRect.height / 2;

      // Target position
      const endX = targetX;
      const endY = targetY;

      // Dispatch mousedown event on the target block
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: startX,
        clientY: startY,
        bubbles: true,
        cancelable: true,
      });
      this.targetBlock.dispatchEvent(mouseDownEvent);

      // Animation parameters
      const duration = durationSeconds * 1000; // Convert to milliseconds
      const frameRate = 60; // Frames per second
      const totalFrames = (duration / 1000) * frameRate;
      let currentFrame = 0;

      // Calculate displacement per frame
      const deltaX = (endX - startX) / totalFrames;
      const deltaY = (endY - startY) / totalFrames;

      // Animation function
      const animateDrag = () => {
        if (currentFrame <= totalFrames) {
          // Current position
          const currentX = startX + deltaX * currentFrame;
          const currentY = startY + deltaY * currentFrame;

          // Dispatch mousemove event
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
          // Dispatch mouseup event to complete the drag
          const mouseUpEvent = new MouseEvent("mouseup", {
            clientX: endX,
            clientY: endY,
            bubbles: true,
            cancelable: true,
          });
          document.dispatchEvent(mouseUpEvent);

          // Allow some time for Blockly to process the new block
          setTimeout(() => {
            // Identify the newly created block in the workspace
            // This assumes that the last block in the workspace is the newly added one
            const blocks = this.workspace.getAllBlocks(false);
            const newBlock = blocks[blocks.length - 1];
            if (newBlock) {
              const blockElement = newBlock.getSvgRoot();
              const blockInstance = new Block(blockElement, newBlock);
              resolve(blockInstance);
            } else {
              reject(new Error("無法在工作區中找到新的積木"));
            }
          }, 500); // Adjust the timeout as necessary
        }
      };

      // Start the animation
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
}

(async () => {
  try {
    // Assume 'workspace' is your Blockly workspace instance
    const workspace = Blockly.getMainWorkspace(); // Adjust based on your setup
    const run = new Runner(workspace);
    const speed = 0.5;
    // Drag the 'control_repeat' block to coordinates (400, 150) over 2 seconds
    const block1 = await run.drag("control_repeat").moveTo(speed, 400, 150);
    window.block1 = block1;
    const block2 = await run.drag("control_repeat").attach(speed, block1);
    const block3 = await run.drag("control_repeat").inside(speed, block2);
    const block4 = await run.drag("control_repeat").inside(speed, block3);
    const block5 = await run.drag("control_repeat").inside(speed, block4);
    const block6 = await run.drag("control_repeat").inside(speed, block5);
  } catch (error) {
    console.error(error.message);
  }
})();
