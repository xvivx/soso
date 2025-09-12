import { memo, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import bridge from '@store/bridge';
import { setDevice, setViewport } from '@store/system';
import { detradePortal } from '@utils/others';

function ResponseViewport() {
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    const { micro } = bridge.get();
    let prevWith = 0;
    const cleans: (() => void)[] = [];
    const onResize = () => {
      const appWidth = getBreakpointByWidth(document.documentElement.clientWidth);

      if (prevWith !== appWidth) {
        prevWith = appWidth;

        const [sizes, breakpoints] = calcBreakpoint(appWidth);
        const deviceRoot = micro ? detradePortal.root : document.documentElement;
        dispatch(micro ? setDevice(breakpoints) : setViewport(breakpoints));
        sizes.forEach(([key, value]) => (value ? deviceRoot.classList.add(key) : deviceRoot.classList.remove(key)));
      }
    };

    onResize();
    window.addEventListener('resize', onResize, false);
    cleans.push(() => window.removeEventListener('resize', onResize));

    if (micro) {
      const appEntry = bridge.get().container;
      let prevWith = 0;
      const observer = new window.ResizeObserver(([entry]) => {
        const appWidth = getBreakpointByWidth(entry.contentRect.width);
        if (prevWith !== appWidth) {
          prevWith = appWidth;

          const [sizes, breakpoints] = calcBreakpoint(appWidth);
          dispatch(setViewport(breakpoints));
          sizes.forEach(([key, value]) => (value ? appEntry.classList.add(key) : appEntry.classList.remove(key)));
        }
      });

      observer.observe(appEntry);
      cleans.push(() => observer.disconnect());
    }

    return () => cleans.forEach((clean) => clean());
  }, [dispatch]);

  return null;
}

export default memo(ResponseViewport);

function getBreakpointByWidth(currentWidth: number) {
  return [1920, 1440, 1366, 1024, 768, 320].find((width) => currentWidth >= width)!;
}

function calcBreakpoint(appWidth: number) {
  const sizes: [string, boolean][] = [
    ['s768', appWidth >= 768],
    ['s1024', appWidth >= 1024],
    ['s1366', appWidth >= 1366],
    ['s1440', appWidth >= 1440],
    ['s1920', appWidth >= 1920],
  ];

  return [
    sizes,
    {
      mobile: appWidth < 768,
      s768: appWidth >= 768 && appWidth < 1024,
      s1024: appWidth >= 1024 && appWidth < 1366,
      s1366: appWidth >= 1366 && appWidth < 1440,
      s1440: appWidth >= 1440 && appWidth < 1920,
      s1920: appWidth >= 1920,
      gt768: appWidth >= 768,
      gt1024: appWidth >= 1024,
      gt1366: appWidth >= 1366,
      gt1440: appWidth >= 1440,
      gt1920: appWidth >= 1920,
    },
  ] as const;
}
