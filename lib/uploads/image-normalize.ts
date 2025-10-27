// Image normalization utilities - resize & crop student photos to 3x4 ratio
// Created: 2025-10-19

export interface NormalizeOptions {
  maxWidth?: number;
  format?: "image/png" | "image/jpeg";
  quality?: number;
  fileName?: string;
}

const TARGET_RATIO = 3 / 4; // width : height

function ensureBrowserEnvironment() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error(
      "Image normalization only supported in browser environment",
    );
  }
}

type LoadedImageSource = ImageBitmap | HTMLImageElement;

async function loadImageBitmap(file: Blob): Promise<LoadedImageSource> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch (error) {
      console.warn(
        "createImageBitmap failed, falling back to HTMLImageElement",
        error,
      );
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (event) => reject(event);
    img.src = URL.createObjectURL(file);
  });
}

function getSourceDimensions(source: LoadedImageSource) {
  if (source instanceof ImageBitmap) {
    return { width: source.width, height: source.height };
  }

  return { width: source.naturalWidth, height: source.naturalHeight };
}

function cleanupBitmap(bitmap: LoadedImageSource) {
  if ("close" in bitmap) {
    try {
      bitmap.close();
    } catch {
      // ignore
    }
  }
  if (bitmap instanceof HTMLImageElement) {
    URL.revokeObjectURL(bitmap.src);
  }
}

export async function normalizeImageToThreeByFour(
  file: File,
  options: NormalizeOptions = {},
): Promise<File> {
  ensureBrowserEnvironment();

  const maxWidth = options.maxWidth ?? 600;
  const format = options.format ?? "image/png";
  const quality = options.quality ?? 0.92;
  const bitmap = await loadImageBitmap(file);
  const { width: sourceWidth, height: sourceHeight } =
    getSourceDimensions(bitmap);

  if (!sourceWidth || !sourceHeight) {
    cleanupBitmap(bitmap);
    throw new Error("Gagal membaca dimensi gambar");
  }

  const sourceRatio = sourceWidth / sourceHeight;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > TARGET_RATIO) {
    // Source too wide, crop horizontally
    cropWidth = Math.round(sourceHeight * TARGET_RATIO);
  } else {
    // Source too tall, crop vertically
    cropHeight = Math.round(sourceWidth / TARGET_RATIO);
  }

  const cropX = Math.floor((sourceWidth - cropWidth) / 2);
  const cropY = Math.floor((sourceHeight - cropHeight) / 2);

  let outputWidth = cropWidth;
  let outputHeight = cropHeight;

  if (cropWidth > maxWidth) {
    const scale = maxWidth / cropWidth;
    outputWidth = Math.round(cropWidth * scale);
    outputHeight = Math.round(cropHeight * scale);
  }

  const canvas =
    "OffscreenCanvas" in window
      ? new OffscreenCanvas(outputWidth, outputHeight)
      : (document.createElement("canvas") as
          | HTMLCanvasElement
          | OffscreenCanvas);

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!context) {
    cleanupBitmap(bitmap);
    throw new Error("Canvas context tidak tersedia");
  }

  context.drawImage(
    bitmap,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  cleanupBitmap(bitmap);

  const blob: Blob = await new Promise((resolve, reject) => {
    if (canvas instanceof OffscreenCanvas) {
      canvas
        .convertToBlob({ type: format, quality })
        .then(resolve)
        .catch(reject);
      return;
    }

    (canvas as HTMLCanvasElement).toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Gagal mengkonversi gambar"));
          return;
        }
        resolve(result);
      },
      format,
      quality,
    );
  });

  const fileName =
    options.fileName ?? `${file.name.replace(/\.[^.]+$/, "")}-3x4`;
  const normalizedFileName = /\.[^.]+$/.test(fileName)
    ? fileName
    : `${fileName}.${format === "image/png" ? "png" : "jpg"}`;

  return new File([blob], normalizedFileName, { type: format });
}
