"use client";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function RangeSlider({
  label = "label",
  min = 0,
  max = 100,
  data,
  setData,
}: {
  label?: string;
  min?: number;
  max?: number;
  data: {
    min: number;
    max: number;
  };
  setData: (data: { min: number; max: number }) => void;
}) {
  const handleOnChange = (value: number[]) => {
    // Add to the search params.
    if (label === "Price") return setData({ min: value[0], max: value[1] });
    if (label === "Size") return setData({ min: value[0], max: value[1] });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">
          {label === "Price" ? formatPrice(data?.min || min) : data.min || min + " mm"}
        </div>
        <div className="text-sm font-semibold">
          {label === "Price" ? formatPrice(data.max || max) : data.max || max + " mm"}
        </div>
      </div>
      <Slider
        range
        min={min}
        max={max}
        step={10}
        defaultValue={[data.min || min, data.max || max]}
        onChange={handleOnChange}
        styles={{
          handle: {
            backgroundColor: "#1d293d",
            borderColor: "#1d293d",
            opacity: 1,
            boxShadow: "none",
          },
          track: {
            backgroundColor: "#62748e",
          },
          rail: {
            backgroundColor: "#cccccc",
          },
        }}
      />
      <div>
        <p className="text-center font-semibold text-sm">{label}</p>
      </div>
    </div>
  );
}
