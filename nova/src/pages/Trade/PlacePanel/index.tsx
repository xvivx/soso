import { memo } from 'react';
import MobilePanel from './MobilePanel';
import PCPanel from './PCPanel';

export default {
  PCPanel: memo(PCPanel),
  MobilePanel: memo(MobilePanel),
};
