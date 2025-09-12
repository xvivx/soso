import { memo } from 'react';
import { useDispatch } from 'react-redux';
import { setTheme, useTheme } from '@store/system';
import { Button } from '@components';

function SwitchTheme() {
  const theme = useTheme();
  const dispatch = useDispatch();

  return (
    <Button
      className="fixed right-4 bottom-4 z-max"
      onClick={() => dispatch(setTheme(theme === 'darken' ? 'lighten' : 'darken'))}
    >
      切换主题
    </Button>
  );
}

export default memo(SwitchTheme);
