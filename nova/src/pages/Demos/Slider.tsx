import { useState } from 'react';
import { AmountInput, Button, Slider as PrimitiveSlider } from '@components';
import Slider from '@pages/components/Slider';

export default function SliderDemo() {
  const [value, setValue] = useState(100);
  const [max, setMax] = useState(1000);
  const [progress, setProgress] = useState(0);

  return (
    <div className="p-6">
      <AmountInput
        className="mb-6"
        value={value.toString()}
        onChange={(value) => setValue(Math.max(Math.min(Number(value), 1000), 1))}
      />
      <Slider
        value={value}
        onChange={(value) => {
          setValue(Math.round(value));
        }}
      />

      <br />

      <div className="flex gap-2 mb-4">
        <Button onClick={() => setMax(300)}>Max=300</Button>
        <Button onClick={() => setMax(1000)}>Max=1000</Button>
      </div>
      <Slider
        max={max}
        value={value}
        onChange={(value) => {
          if (value > 500) return setValue(500);
          setValue(Math.round(value));
        }}
      />

      <div className="mt-6">基础Slider: 提供0-1的变化</div>
      <PrimitiveSlider value={progress} onChange={setProgress} />
      <div>Value: {progress}</div>
    </div>
  );
}
