import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils';
import ContractImg from './img/Contract.png';
import TradingImg from './img/Trading.png';
import UpDownImg from './img/UpDown.png';
import QuickDemo from './QuickDemo';

function ProductDescription() {
  const [active, setActive] = useState(0);
  const { t } = useTranslation();

  return (
    <div>
      <div className="mx-auto px-3.5 pt-9 s768:pt-21 pb-15 s768:pb-44" style={{ maxWidth: 1200 }}>
        <div className="mx-auto text-center mb-15">
          <div className="text-32 s768:text-44 font-700">{t('Product Description')}</div>
          <div className="text-16 text-secondary my-6">{t('Detrade offers 3 types of optional products.')}</div>
        </div>
        <div className="px-6 py-11 s768:px-15 s768:py-6 rounded-6 bg-white relative overflow-hidden">
          {active === 0 && (
            <Trading>
              <Indicator active={active} onChange={setActive} />
            </Trading>
          )}
          {active === 1 && (
            <Futures>
              <Indicator active={active} onChange={setActive} />
            </Futures>
          )}
          {active === 2 && (
            <UpDown>
              <Indicator active={active} onChange={setActive} />
            </UpDown>
          )}
        </div>
      </div>
      <QuickDemo />
    </div>
  );
}
export default ProductDescription;

interface IndicatorProps {
  active: number;
  onChange: (index: number) => void;
}
function Indicator(props: IndicatorProps) {
  const { active, onChange } = props;
  return (
    <div className="flex gap-2 mt-4 mb-8 mx-auto s768:mx-0">
      {[0, 1, 2].map((t) => (
        <div
          onClick={() => onChange(t)}
          className={cn('w-20 h-1.5 bg-black/10 cursor-pointer', t === active && 'bg-brand')}
          key={t}
        />
      ))}
    </div>
  );
}

function Trading({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between flex-col s768:flex-row">
      <div className="mt-0 s768:mt-15 flex flex-col justify-between h-[500px] s768:h-[370px]" style={{ maxWidth: 558 }}>
        <div className="flex flex-col gap-4">
          <svg
            className="mx-auto s768:mx-0"
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="70" height="70" rx="35" fill="#0063F5" fillOpacity="0.1" />
            <path
              d="M52 51.2917C52 51.6827 51.6827 52 51.2917 52H21.5417C19.5895 52 18 50.4105 18 48.4583V18.7083C18 18.3173 18.3173 18 18.7083 18C19.0993 18 19.4167 18.3173 19.4167 18.7083V48.4583C19.4167 49.6299 20.3701 50.5833 21.5417 50.5833H51.2917C51.6827 50.5833 52 50.9007 52 51.2917ZM48.4583 25.0833H42.7917C42.4007 25.0833 42.0833 25.4007 42.0833 25.7917C42.0833 26.1827 42.4007 26.5 42.7917 26.5H48.4583C48.7856 26.5 49.0958 26.5751 49.3735 26.7068L41.1979 34.3767C40.3706 35.2054 39.0219 35.2068 38.1478 34.3356L36.7963 33.2037C35.4604 31.8663 33.1172 31.8734 31.7955 33.1966L23.882 40.8664C23.6015 41.1384 23.5944 41.5875 23.8664 41.868C24.0052 42.0111 24.1908 42.0833 24.375 42.0833C24.5521 42.0833 24.7306 42.0167 24.868 41.8836L32.7886 34.2067C33.5904 33.4048 34.9462 33.3623 35.8387 34.2477L37.1902 35.3797C38.57 36.7609 40.8182 36.7609 42.1825 35.3952L50.3581 27.7254L50.3737 27.7098C50.5068 27.9875 50.5819 28.2977 50.5819 28.6264V34.2931C50.5819 34.6841 50.8992 35.0014 51.2902 35.0014C51.6812 35.0014 51.9986 34.6841 51.9986 34.2931V28.625C51.9986 26.6728 50.4105 25.0833 48.4583 25.0833Z"
              fill="#0063F5"
            />
          </svg>
          <div className="text-36 mx-auto s768:mx-0">{t('Trading')}</div>
          <div className="text-secondary text-16">
            {t(
              'Regular binary options products, based on whether the closing price of an underlying asset within a specified period of time (such as the next 30 seconds, one minute, one hour, etc.) is lower or higher than the execution price, determines whether to obtain a profit. This product is a short-term investment. This option is suitable for markets with less volatile price movements.'
            )}
          </div>
        </div>
        {children}
      </div>
      <img src={TradingImg} alt="_" className="h-[667px] s768:h-[470px]" />
    </div>
  );
}

function Futures({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between flex-col s768:flex-row">
      <div className="mt-0 s768:mt-15 flex flex-col justify-between h-[500px] s768:h-[370px]" style={{ maxWidth: 558 }}>
        <div className="flex flex-col gap-4">
          <svg
            className="mx-auto s768:mx-0"
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="70" height="70" rx="35" fill="#0063F5" fillOpacity="0.1" />
            <g clipPath="url(#clip0_1306_16668)">
              <path
                d="M52 51.2917C52 51.6827 51.6827 52 51.2917 52H24.375C20.8602 52 18 49.1397 18 45.625V18.7083C18 18.3173 18.3173 18 18.7083 18C19.0993 18 19.4167 18.3173 19.4167 18.7083V45.625C19.4167 48.3592 21.6408 50.5833 24.375 50.5833H51.2917C51.6827 50.5833 52 50.9007 52 51.2917ZM44.2083 46.3333C44.5993 46.3333 44.9167 46.016 44.9167 45.625V27.2083C44.9167 26.8173 44.5993 26.5 44.2083 26.5C43.8173 26.5 43.5 26.8173 43.5 27.2083V45.625C43.5 46.016 43.8173 46.3333 44.2083 46.3333ZM38.5417 46.3333C38.9327 46.3333 39.25 46.016 39.25 45.625V34.2917C39.25 33.9007 38.9327 33.5833 38.5417 33.5833C38.1507 33.5833 37.8333 33.9007 37.8333 34.2917V45.625C37.8333 46.016 38.1507 46.3333 38.5417 46.3333ZM32.875 46.3333C33.266 46.3333 33.5833 46.016 33.5833 45.625V27.2083C33.5833 26.8173 33.266 26.5 32.875 26.5C32.484 26.5 32.1667 26.8173 32.1667 27.2083V45.625C32.1667 46.016 32.484 46.3333 32.875 46.3333ZM27.2083 46.3333C27.5993 46.3333 27.9167 46.016 27.9167 45.625V34.2917C27.9167 33.9007 27.5993 33.5833 27.2083 33.5833C26.8173 33.5833 26.5 33.9007 26.5 34.2917V45.625C26.5 46.016 26.8173 46.3333 27.2083 46.3333Z"
                fill="#0063F5"
              />
            </g>
            <defs>
              <clipPath id="clip0_1306_16668">
                <rect width="34" height="34" fill="white" transform="translate(18 18)" />
              </clipPath>
            </defs>
          </svg>
          <div className="text-36 mx-auto s768:mx-0">{t('Futures')}</div>
          <div className="text-secondary text-16">
            {t(
              'Futures trading is a transaction relative to the spot market. Users can judge the rise or fall in futures contract trading and choose to buy long or sell short contracts to obtain profits from rising or falling prices. At the same time, users can borrow additional funds to increase the size of their positions by increasing leverage.'
            )}
          </div>
        </div>
        {children}
      </div>
      <img src={ContractImg} alt="" className="h-[667px] s768:h-[470px]" />
    </div>
  );
}

function UpDown({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between flex-col s768:flex-row">
      <div className="mt-0 s768:mt-15 flex flex-col justify-between h-[500px] s768:h-[370px]" style={{ maxWidth: 558 }}>
        <div className="flex flex-col gap-4">
          <svg
            className="mx-auto s768:mx-0"
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="70" height="70" rx="35" fill="#0063F5" fillOpacity="0.1" />
            <path
              d="M48.4583 18H21.5417C19.5881 18 18 19.5895 18 21.5417V52H52V21.5417C52 19.5895 50.4119 18 48.4583 18ZM50.5833 50.5833H19.4167V21.5417C19.4167 20.3701 20.3701 19.4167 21.5417 19.4167H48.4583C49.6299 19.4167 50.5833 20.3701 50.5833 21.5417V50.5833ZM30.1281 27.1219L34.7932 31.787L33.7916 32.7886L29.3348 28.3317V43.5H27.9181V28.3317L23.4612 32.7886L22.4597 31.787L27.1248 27.1219C27.9521 26.2932 29.3022 26.2932 30.1295 27.1219H30.1281ZM46.5416 37.21L47.5432 38.2116L42.8781 42.8767C42.4644 43.2903 41.919 43.4972 41.375 43.4972C40.831 43.4972 40.2856 43.2903 39.8719 42.8767L35.2068 38.2116L36.2084 37.21L40.6652 41.6668V26.5H42.0819V41.6683L46.5387 37.2114L46.5416 37.21Z"
              fill="#0063F5"
            />
          </svg>
          <div className="text-36 mx-auto s768:mx-0">{t('Up & Down')}</div>
          <div className="text-secondary text-16">
            {t(
              `Players can predict the price of Bitcoin. Players can join a pool that predicts price increases or decreases and invest a certain amount of money to participate in the game. The winner will distribute the counterparty's capital pool assets according to the investment ratio. A new game can only be started after players from all previous rounds have received their payoffs.`
            )}
          </div>
        </div>
        {children}
      </div>
      <img src={UpDownImg} alt="" className="h-[667px] s768:h-[470px]" />
    </div>
  );
}
