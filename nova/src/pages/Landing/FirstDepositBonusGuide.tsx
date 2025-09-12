import { Trans, useTranslation } from 'react-i18next';

function FirstDepositBonusGuide() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto px-2.5 s768:px-0 pt-9 s768:pt-21 pb-9 s768:pb-21" style={{ maxWidth: 1200 }}>
      <div className="text-32 s768:text-44 mb-8 s768:mb-15 text-center font-700">{t('First deposit bonus guide')}</div>
      <div className="text-16 my-6">
        <Trans
          i18nKey={t(
            `Welcome to detrade! To thank you for your support, we're offering <0>up to 50 USDT in trading bonus</0> for new users.Experience binary options trading with zero risk and real rewards!`
          )}
        >
          <span className="font-700" />
        </Trans>
      </div>
      <hr className="my-8 border-thirdly" />
      <div className="text-22">{t('Bonus Rules')}</div>
      <ul className="text-secondary">
        <li>
          <Trans i18nKey={t('<0>Eligibility:</0> New users on Detrade only')}>
            <span className="font-700" />
          </Trans>
        </li>
        <li>
          <Trans i18nKey={t('<0>Requirement:</0> First deposit ≥ 50 USDT (or equivalent crypto)')}>
            <span className="font-700" />
          </Trans>
        </li>
        <li>
          <Trans i18nKey={t('<0>Bonus amount:</0> 50% of your first deposit')}>
            <span className="font-700" />
          </Trans>
        </li>
        <li>
          <Trans i18nKey={t('<0>Bonus cap:</0> Maximum 50 USDT trading bonus')}>
            <span className="font-700" />
          </Trans>
        </li>
      </ul>
      <div className="text-18">{t('Examples')}:</div>
      <ul className="text-secondary">
        <li>{t('Deposit 80 USDT → Receive 40 USDT bonus')}</li>
        <li>{t('Deposit 120 USDT → Receive capped bonus of 50 USDT')}</li>
      </ul>
      <hr className="my-8 border-thirdly" />
      <div className="text-22">{t('How to Claim Your Bonus')}</div>
      <ul className="text-secondary">
        <li>
          <Trans
            i18nKey={t(
              'After completing your first deposit, go to the <0>Reward Center</0> to view your initial 1 USDT trial voucher.'
            )}
          >
            <span className="font-700" />
          </Trans>
        </li>
        <li>
          {t(
            'Once you unlock all 4 trading modes (HighLow / Spread / Future / Up Down), your full bonus (50% of your deposit) will be issued automatically.'
          )}
        </li>
        <li>{t('Go to the Reward Center and manually activate your bonus voucher.')}</li>
        <li>
          {t(
            'Once activated, if your position size ≥ bonus value, the system will automatically use the bonus first for the trade.'
          )}
        </li>
      </ul>
      <hr className="my-8 border-thirdly" />
      <div className="text-22">{t('Usage Instructions & Limitations')}</div>
      <ul className="text-secondary">
        <li>
          <Trans i18nKey={t('<0>Supported products</0>: Highlow, Spread, Up Down, Future')}>
            <span className="font-700" />
          </Trans>
        </li>
        <li className="font-700">{t('P&L from bonus trades will be credited directly to your real account')}</li>
        <li>
          <Trans i18nKey={t('Each user is eligible for <0>only one</0> first deposit bonus')}>
            <span className="font-700" />
          </Trans>
        </li>
        <li>
          <Trans
            i18nKey={t(
              'Bonus vouchers are <0>non-withdrawable</0>, but <1>profits from bonus trades are withdrawable<1>'
            )}
          >
            <span className="font-700" />
            <span className="font-700" />
          </Trans>
        </li>
      </ul>
      <hr className="my-8 border-thirdly" />
      <div className="text-22">{t('Risk Control & Compliance Notice')}</div>
      <div className="text-secondary">
        {t(
          'To maintain fairness and integrity, Detrade will monitor accounts participating in the bonus program through behavioral and technical checks, including but not limited to device fingerprinting, IP tracking, and transaction pattern analysis.'
        )}
      </div>
      <div className="text-secondary">
        {t('We reserve the right to cancel bonuses and related profits under the following conditions:')}
      </div>
      <ul className="text-secondary">
        <li>{t('Multi-account abuse or airdrop farming behavior')}</li>
        <li>{t('False deposits, money laundering, or manipulation to trigger rewards')}</li>
        <li>{t('Exploiting platform bugs or system loopholes')}</li>
      </ul>
      <div className="text-secondary">
        {t('If you believe your account was flagged in error, please contact official support to appeal.')}
      </div>
      <hr className="my-8 border-thirdly" />
      <div className="text-22">{t('Frequently Asked Questions (FAQ)')}</div>
      <div>{t('Q1: Can I withdraw the bonus?')}</div>
      <div className="text-secondary">
        <Trans
          i18nKey={t(
            'A: No, the bonus itself is not withdrawable. However, any <0>profits made using the bonus</0> can be withdrawn.'
          )}
        >
          <span className="font-700" />
        </Trans>
      </div>
      <div>{t(`Q2: Will my bonus expire if I don't activate it?`)}</div>
      <div className="text-secondary">
        <Trans
          i18nKey={t(
            'A: Yes. Please activate your bonus within <0>7 days</0> of issuance. Expired bonuses cannot be recovered.'
          )}
        >
          <span className="font-700" />
        </Trans>
      </div>
      <div>{t(`Q3: I made a deposit but didn't receive a bonus. What should I do?`)}</div>
      <div className="text-secondary">
        {t(
          'A: Make sure you’ve unlocked all four trading modes. If the issue persists, contact customer support for help.'
        )}
      </div>
      <hr className="my-8 border-thirdly" />
      <div className="text-22">{t('Important Reminders')}</div>
      <ul className="text-secondary">
        <li>{t('Detrade reserves the final interpretation rights for this campaign.')}</li>
        <li>
          {t(
            'The platform may adjust the campaign based on market and policy changes. Updates will be posted via official announcements.'
          )}
        </li>
        <li>
          {t(
            'This event is only available to users in eligible countries and regions as defined by platform compliance policies.'
          )}
        </li>
      </ul>
      <hr className="my-8 border-thirdly" />

      <div className="text-22">{t('Risk Disclaimer')}</div>
      <div className="text-secondary">
        <Trans
          i18nKey={t(
            'The trading bonus is a <0>marketing incentive</0> provided by Detrade to help users explore our trading system. Bonus funds <1>cannot be withdrawn<1>, but profits from using them can affect your real account balance.'
          )}
        >
          <span className="font-700" />
          <span className="font-700" />
        </Trans>
      </div>
      <div className="text-secondary">
        {t(
          `Trading involves risk. Please ensure you understand what you're doing before using leverage or bonus funds. Detrade is not liable for any losses incurred through bonus trading.`
        )}
      </div>
      <hr className="my-8 border-thirdly" />
      <div>{t(`Need help? Visit our Help Center or contact Customer Support. We're here to help you 24/7.`)}</div>
    </div>
  );
}

export default FirstDepositBonusGuide;
