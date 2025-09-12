import React from 'react';
import yIcon from '../assets/y-icon.png';

const StepIndicator: React.FC<{ step: number }> = ({ step }) => (
  <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
    <img src={yIcon} alt="" className="w-full h-full" />
    <span className="absolute text-primary_brand text-20 font-700">{step}</span>
  </div>
);

export default React.memo(StepIndicator);
