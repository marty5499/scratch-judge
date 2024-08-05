class DrawTestCase {
  constructor(judge) {
    //window.frameRate = 3;
    this.vm = judge.vm;
    this.judge = judge;
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

  requestAnimationFramePromise() {
    return new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
  }

  async readPixels(gl, pixels) {
    while (true) {
      await this.requestAnimationFramePromise();

      // 确保所有渲染操作都已完成
      gl.finish();

      // 读取像素数据
      gl.readPixels(
        0,
        0,
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
      );

      // 检查是否读取到了有效数据
      let isValid = false;
      for (let i = 0; i < pixels.length; i += 4) {
        if (
          pixels[i] !== 0 ||
          pixels[i + 1] !== 0 ||
          pixels[i + 2] !== 0 ||
          pixels[i + 3] !== 255
        ) {
          isValid = true;
          break;
        }
      }

      if (isValid) {
        //console.log("成功读取像素数据:", pixels);
        break;
      } else {
        //console.warn("读取到空数据，重试...");
        await this.delay(50); // 等待一段时间后重试
      }
    }
  }

  async captureAndCompare(stageURL) {
    //await this.vm.stopAll();
    const gl = this.render._gl;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    var pixels = new Uint8Array(width * height * 4);
    await this.readPixels(gl, pixels);
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = width;
    captureCanvas.height = height;
    const context = captureCanvas.getContext("2d");
    // 创建 ImageData 对象来存储像素数据
    var imageData = context.createImageData(width, height);
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
    //console.log("user imageData:", imageData.data);
    context.putImageData(imageData, 0, 0);
    //this.downloadImage(captureCanvas);
    const base64Image = captureCanvas.toDataURL();
    const referenceImage = await this.getBase64Image(stageURL);
    //console.log("user base64:", base64Image.length);
    //console.log("ref. base64:", referenceImage.length);
    const data = await this.compareImages(referenceImage, base64Image);
    return data;
  }

  async compareImages(referenceImage, base64Image) {
    return new Promise((resolve, reject) => {
      resemble(referenceImage)
        .compareTo(base64Image)
        .onComplete((data) => {
          resolve(data);
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

  onCompleted(scriptSrc) {
    console.log(scriptSrc + "run completed.");
  }
}
