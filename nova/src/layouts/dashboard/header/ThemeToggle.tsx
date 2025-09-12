import { useDispatch } from 'react-redux';
import { setTheme, useTheme } from '@store/system';
import { Button, SvgIcon } from '@components';

function ThemeToggle() {
  const theme = useTheme();
  const dispatch = useDispatch();

  return (
    <Button
      theme="secondary"
      icon={<SvgIcon className="size-5 s768:size-7" name={theme === 'darken' ? 'dark' : 'light'} />}
      onClick={() => dispatch(setTheme(theme === 'darken' ? 'lighten' : 'darken'))}
    />
  );
}

export default ThemeToggle;
