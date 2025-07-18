"use client";

import { useState, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CameraIcon, MinusCircleIcon, SaveIcon, UploadIcon } from "lucide-react";

export default function AdminImageUploader({
  aspectRatio,
  onSave,
}: {
  aspectRatio: [number, number];
  onSave: (blob: Blob) => void;
}) {
  const aspect = aspectRatio[0] / aspectRatio[1];

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedBlob = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropWidth = completedCrop.width! * scaleX;
    const cropHeight = completedCrop.height! * scaleY;

    let targetWidth = cropWidth;
    let targetHeight = cropHeight;

    if (cropWidth < 1000) {
      const scaleUpFactor = 1000 / cropWidth;
      targetWidth = 1000;
      targetHeight = cropHeight * scaleUpFactor;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(
      image,
      completedCrop.x! * scaleX,
      completedCrop.y! * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 1.0);
    });
  };

  const handlePreview = async () => {
    const blob = await getCroppedBlob();
    if (!blob) return;
    setImageSrc(null);
    onSave(blob);
  };

  return (
    <div className="w-full max-w-md mb-6">
      <Label htmlFor="uploadFile" className="my-4">
        <Card className="w-full">
          <CardHeader className="flex items-center gap-3">
            <UploadIcon />
            <div>
              <CardTitle>画像を選択</CardTitle>
              <CardDescription>お使いの端末から画像を選んでください。</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <input
          ref={inputRef}
          type="file"
          id="uploadFile"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </Label>

      <Label htmlFor="pictureFile" className="my-4 md:hidden">
        <div className="flex items-center gap-4 pl-6 my-6">
          <CameraIcon /> <span>Take a Pic</span>
        </div>
        <input
          type="file"
          id="pictureFile"
          capture="environment"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </Label>

      {imageSrc && (
        <div className="relative w-full mb-4 rounded-lg overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            keepSelection
            ruleOfThirds
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="source"
              className="max-w-full"
            />
          </ReactCrop>
        </div>
      )}

      {imageSrc && (
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handlePreview}>
            <SaveIcon /> トリミングして保存
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setImageSrc(null);
              setImageSrc(null);
              setCompletedCrop(null);
              if (inputRef.current !== null) inputRef.current.defaultValue = "";
            }}
          >
            <MinusCircleIcon /> キャンセル
          </Button>
        </div>
      )}

      <canvas ref={previewCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
