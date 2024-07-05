class DrawTestCase {
  constructor(judge) {
    //window.frameRate = 3;
    this.vm = judge.vm;
    this.render = judge.vm.runtime.renderer;
  }

  async getBase64Image(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          reject(new Error("Failed to convert image to Base64"));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  }

  captureRenderArea(stageURL, callback) {
    const gl = this.render._gl;
    this.vm.stopAll();
    requestAnimationFrame(async () => {
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
        const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = width;
      captureCanvas.height = height;
      const context = captureCanvas.getContext("2d");
      // 创建 ImageData 对象来存储像素数据
      const imageData = context.createImageData(width, height);
      // 将像素数据复制到 ImageData 对象，并翻转图像
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const pixelIndex = (i * width + j) * 4;
          const flippedIndex = ((height - i - 1) * width + j) * 4;
          imageData.data[pixelIndex] = pixels[flippedIndex];
          imageData.data[pixelIndex + 1] = pixels[flippedIndex + 1];
          imageData.data[pixelIndex + 2] = pixels[flippedIndex + 2];
          imageData.data[pixelIndex + 3] = pixels[flippedIndex + 3];
        }
      }
      console.log("imageData:", imageData);
      context.putImageData(imageData, 0, 0);
      this.downloadImage(captureCanvas);
      const base64Image = captureCanvas.toDataURL();
      const referenceImage = await this.getBase64Image(stageURL);
      resemble(referenceImage).compareTo(base64Image).onComplete(function (data) {
        callback(data);
      });
    });
  }

  downloadImage(captureCanvas) {
    captureCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "canvas.png";
      link.click();
    }, "image/png");
  }

  async delay(ms) {
    return new Promise((resolve) =>
      setTimeout(resolve, parseInt(ms * window.runSpeed))
    );
  }
}
