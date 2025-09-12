import { useSelector } from 'react-redux';

export function useMediaQuery() {
  return useSelector((state) => state.system.viewport);
}
