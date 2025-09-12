import {
  createContext,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { SvgIcon } from '@components';
import { cn } from '@utils';
import Button from './Button';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  autoPlay?: boolean;
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & CarouselProps>(
  ({ orientation = 'horizontal', opts, setApi, plugins, className, children, autoPlay = true, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins
    );

    useEffect(() => {
      if (!autoPlay) {
        return;
      }

      let interval: NodeJS.Timeout;

      function stop() {
        clearInterval(interval);
      }

      function start() {
        interval = setInterval(() => {
          api?.scrollNext();
        }, 8000);
      }

      start();
      api?.on('pointerUp', start);
      api?.on('pointerDown', stop);

      return () => {
        stop();
        api?.destroy();
      };
    }, [api, autoPlay]);

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onSelect = useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

const CarouselContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-4' : 'pt-4', className)}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

function Controllers() {
  const { api } = useCarousel();
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(() => {
    return api?.scrollSnapList();
  }, [api]);

  useEffect(() => {
    function onSelect(api: CarouselContextProps['api']) {
      setActiveIndex(api?.selectedScrollSnap() || 0);
    }

    api?.on('select', onSelect);

    return () => {
      api?.off('select', onSelect);
    };
  }, [api]);

  return (
    <div className="relative flex justify-center gap-2 mt-15 py-2">
      {slides?.map((_, index) => {
        return (
          <div key={index} className="py-2 cursor-pointer" onClick={() => api?.scrollTo(index)}>
            <div
              className={cn('w-20 h-1.5 bg-white/10 transition-all duration-500', activeIndex === index && 'bg-brand')}
            />
          </div>
        );
      })}
    </div>
  );
}

const CarouselPrevious = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        icon
        size="free"
        theme="transparent"
        className={cn('shrink-0 size-7 shadow-none text-quarterary', className)}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <SvgIcon name="arrow" className="rotate-180 size-full" />
      </Button>
    );
  }
);
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { scrollNext, canScrollNext } = useCarousel();
    return (
      <Button
        ref={ref}
        icon
        size="free"
        theme="transparent"
        className={cn('shadow-none size-7 shrink-0 text-quarterary', className)}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <SvgIcon name="arrow" className="size-full" />
      </Button>
    );
  }
);

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, Controllers, CarouselPrevious, CarouselNext };
