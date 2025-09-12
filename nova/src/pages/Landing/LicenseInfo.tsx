import { useTranslation } from 'react-i18next';
import SvgFlame from '@components/SvgIcon/private/flame.svg';

function LicenseInformation() {
  const { t } = useTranslation();

  return (
    <div className="p-4 s768:px-0 s768:pt-3 s768:pb-16 bg-layer2">
      <div className="bg-layer3 rounded-2 p-4 s768:px-8 s768:py-4 m-auto" style={{ maxWidth: 1200 }}>
        <div className="text-16 font-500 pb-4 border-b border-solid border-thirdly">{t('License Information')}</div>
        <div className="space-y-6 text-14 text-primary font-400 pt-4">
          <div className="flex flex-col gap-7 s768:flex-row">
            <a href="https://mwaliregistrar.com/list_of_entities/verify/435" target="_blank" rel="noreferrer">
              <SvgFlame className="w-14 h-21" />
            </a>
            <div>
              <p>{t('Brokerage Products and Services offered by Nexus Play LLC.')}</p>
              <p>
                {t(
                  'Nexus Play LLC, a Brokerage Company authorised and regulated by the Mwali International Services Authority (M.I.S.A.) under the License #BFX2024137.'
                )}
              </p>
              <p>
                {t(
                  'Nexus Play LLC is a Brokerage that provides self-directed investors with brokerage services, and does not make recommendations or offer investment, financial, legal or tax advice. '
                )}
              </p>
            </div>
          </div>
          <p>
            {t(
              'Online trading carries inherent risks, including fluctuations in system response and access times due to market conditions, system performance, and other factors. Before trading, consult an independent, licensed financial advisor and ensure you have the necessary risk appetite, experience, and knowledge. Under no circumstances shall Nexus Play LLC have any liability to any person or entity for any direct, indirect, special, consequential or incidental damages whatsoever. '
            )}
          </p>
          <p>
            {t(
              'The products and services offered by Nexus Play LLC are not intended for residents of the United States, European Union, or any other jurisdictions where such services and products are prohibited by law. Nexus Play LLC does not solicit business or provide brokerage services to individuals or entities in these regions. It is the responsibility of potential clients to be aware of and comply with any applicable laws and regulations in their respective jurisdictions before engaging in online trading. By accessing this website and utilizing our services, you confirm that you are not a resident of the United States, European Union, or any other jurisdiction where our services are restricted.'
            )}
          </p>
          <div>
            <p>{t('All brokerage activity on this website is provided by Nexus Play LLC.')}</p>
            <p>{t('Copyright © 2025 Nexus Play LLC. All rights reserved.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LicenseInformation;
