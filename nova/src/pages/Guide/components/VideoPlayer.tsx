import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@store/system';
import videoLightIcon from '../assets/video-l.png';
import videoIcon from '../assets/video.png';

const VideoPlayer: React.FC = () => {
  const theme = useTheme();
  return (
    <div className="w-3/5 h-full flex" style={{ maxHeight: 680 }}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full h-full"
      >
        <img className="w-full h-full object-contain" src={theme === 'darken' ? videoIcon : videoLightIcon} alt="" />
      </motion.div>
    </div>
  );
};

export default React.memo(VideoPlayer);
