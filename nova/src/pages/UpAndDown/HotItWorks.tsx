import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Modal, SvgIcon } from '@components';
import { cn } from '@utils';
import MediaImage from '@pages/components/MediaImage';
import m4 from '@/assets/mobile/m_4.png';
import m5 from '@/assets/mobile/m_5.png';
import m13 from '@/assets/mobile/m_13.png';
import m14 from '@/assets/mobile/m_14.png';
import m15 from '@/assets/mobile/m_15.png';
import m16 from '@/assets/mobile/m_16.png';
import m17 from '@/assets/mobile/m_17.png';
import image1 from './images/how_work_v2_1.png';
import image2 from './images/how_work_v2_2.png';
import image3 from './images/how_work_v2_3.png';
import image4 from './images/how_work_v2_4.png';
import image5 from './images/how_work_v2_5.png';
import image6 from './images/how_work_v2_6.png';
import { Animate } from './main/WinAnimate';

function HotItWorks() {
  const [step, setStep] = useState(1);
  const { mobile } = useMediaQuery();

  if (mobile) {
    return (
      <>
        <Step1 />
        <br />
        <Step2 />
        <br />
        <Step3 />
        <Step4 />
      </>
    );
  }

  return (
    <>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}

      <Modal.Footer className="flex justify-between">
        <div className="flex items-center gap-1 px-6 py-3 italic text-14 font-700 bg-layer3 rounded-2">
          <Trans i18nKey="{{step}}<0>of {{total}}</0>" values={{ step, total: 4 }}>
            <span className="text-[#A4A8AB]" />
          </Trans>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className={cn('px-4 py-2 bg-layer3', step === 1 ? 'cursor-not-allowed' : '')}
            onClick={() => setStep(Math.max(step - 1, 1))}
            disabled={step === 1}
            icon={<SvgIcon name="arrow" className={cn('rotate-180', step === 1 ? 'text-secondary' : 'text-primary')} />}
            theme="secondary"
          />
          <Button
            className={cn('px-4 py-2 bg-layer3', step === 4 ? 'cursor-not-allowed' : '')}
            onClick={() => setStep(Math.min(step + 1, 4))}
            disabled={step === 4}
            icon={<SvgIcon name="arrow" className={cn(step === 4 ? 'text-secondary' : 'text-primary')} />}
            theme="secondary"
          />
        </div>
      </Modal.Footer>
    </>
  );
}

export default HotItWorks;

function Step1() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-4">{t('1. Choose the future price direction')}</div>
      <div className="gap-5 s768:flex">
        <div className="flex-1 mb-8 s1024:mb-0">
          <MediaImage
            className="object-contain w-full h-32 mb-3 rounded-2 bg-layer2"
            pcSrc={image1}
            mSrc={m13}
            alt="image1"
          />
          <div className="text-12 font-400">
            {t('Choose the upward or downward direction to place an order within the specified time of the countdown.')}
          </div>
        </div>
        <div className="flex-1 mb-8 s1024:mb-0">
          <MediaImage
            className="object-contain w-full h-32 mb-3 rounded-2 bg-layer2"
            pcSrc={image2}
            mSrc={m4}
            alt="image2"
          />
          <div>{t('If you think the price will go up, choose UP to go with the trend.')}</div>
        </div>
        <div className="flex-1">
          <MediaImage
            className="object-contain w-full h-32 mb-3 rounded-2 bg-layer2"
            pcSrc={image3}
            mSrc={m5}
            alt="image3"
          />
          <div>{t('If you think the price will fall, choose DOWN to catch the drop.')}</div>
        </div>
      </div>
    </div>
  );
}

function Step2() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-4">
        {t(
          '2. You can view the total order amount of the fund pool in the UP and DOWN directions and the order status of you and other users in the list.'
        )}
      </div>
      <div className="s1024:flex gap-1.5 justify-center">
        <MediaImage
          className="w-full s1024:w-50 min-h-[120px] s1024:min-h-[350px] mb-4 s768:mb-0 object-contain bg-layer2 rounded-2"
          pcSrc={image4}
          mSrc={m15}
          alt="image4"
        />
      </div>
    </div>
  );
}

function Step3() {
  const { t } = useTranslation();
  const { gt1024 } = useMediaQuery();

  return (
    <div className="pb-4">
      <div className="mb-4">{t('3. Wait for system settlement')}</div>
      <div className="mb-4 overflow-hidden rounded-2" style={gt1024 ? { height: 370 } : {}}>
        <MediaImage
          className="block w-full h-full min-h-[400px] s1024:min-h-[370px]"
          pcSrc={image5}
          mSrc={m16}
          alt="image5"
        />
      </div>
      <div className="text-primary text-12 font-400">
        {t(
          'When the countdown ends, it enters the preparation settlement process. The system records the starting price after the countdown ends (at the first flag). When the K-line runs for a period of time, the system records the ending price (at the second flag). Compare the end price and the start price. If the end price is greater than the start price, the trader who chooses the UP direction wins. Otherwise, the trader who chooses the DOWN direction wins.'
        )}
      </div>
    </div>
  );
}

function Step4() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-4">{t('4. Check the winning and losing results')}</div>
      <div className="gap-4 s1024:flex">
        <MediaImage
          className="w-full min-h-[120px] s1024:min-h-[420px] s1024:w-60 shrink-0 rounded-2 mb-4 s1024:mb-0 object-contain bg-layer2"
          pcSrc={image6}
          mSrc={m14}
          alt="image6"
        />
        <div className="rounded-2 bg-layer2">
          <div className="relative p-2 mb-2 overflow-hidden rounded-2">
            <MediaImage
              className="block object-contain bg-layer2 min-h-[400px] s1024:min-h-[300px]"
              pcSrc={image5}
              mSrc={m17}
              alt="image5"
            />
            <div className="absolute inset-0 z-10 bg-black/60" />
            <div className="z-20 abs-center">
              <div className="scale-50 s1024:scale-75">
                <Animate isMobile winAmount={9995.62} />
              </div>
            </div>
          </div>
          <div className="mb-2 text-primary text-12 font-400">
            {t(
              'The system displays the winning and losing results of the UP and DOWN capital pools. When you make a profit, you will see your profit amount.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
