import { useSelector } from 'react-redux';

export default function useDevice() {
  return useSelector((state) => (import.meta.env.REACT_APP_SDK ? state.system.device : state.system.viewport));
}
