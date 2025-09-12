import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@components';
import { ANIMATION_CONFIG } from '../animationConfig';
import { GuidanceCardConfig } from '../constants';
import StepIndicator from './StepIndicator';

const GuidanceCard: React.FC<{ config: GuidanceCardConfig; isVisible: boolean }> = ({ config, isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      key={`step-${config.step}`}
      className="relative w-4/5 mx-auto bg-layer4 rounded-3 p-6 text-center mt-8"
      style={{
        boxShadow: '0px 4px 24px 0px rgba(0,0,0,0.2)',
      }}
      {...ANIMATION_CONFIG.cardTransition}
    >
      <StepIndicator step={config.step} />
      <div className="mb-4">{config.icon}</div>
      <h3 className="w-4/5 mx-auto text-primary text-18 font-600 leading-snug mb-4">
        {config.title}
        {config.subtitle && (
          <>
            <br />
            {config.subtitle}
          </>
        )}
      </h3>
      {config.showButton && config.buttonText && config.onButtonClick && (
        <Button className="w-40 font-24" onClick={config.onButtonClick}>
          {config.buttonText}
        </Button>
      )}
    </motion.div>
  );
};

export default React.memo(GuidanceCard);
