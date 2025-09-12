import { useTranslation } from 'react-i18next';

function UserAgreement() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="py-20 mx-auto" style={{ maxWidth: 1200 }}>
        <div
          className="p-2.5 text-18 font-700"
          style={{
            borderLeft: '14px solid #828282',
          }}
        >
          {t('User Agreement and Terms & Conditions')}
        </div>
        <div className="p-2.5">
          <p className="my-4">
            {t(
              `Welcome to Detrade, a leading binary options trading platform. Before you begin using our platform, please carefully read and understand the following terms and conditions. By accessing or using Detrade's platform,you agree to be bound by these terms and conditions.If you do not agree with any part of these terms,you must not use our platform.`
            )}
          </p>
          <p className="my-4 font-600">{t('1.Introduction')}</p>
          <p className="my-4">
            {t(
              `1.1 Detrade("we","us",or"our")operates an online binary options trading platform("Platform")that enables traders("you"or"trader")to trade various financial instruments.`
            )}
          </p>
          <p className="my-4">
            {t(
              `1.2 This User Agreement and Terms&Conditions("Agreement")governs your use of Detrade's Platform. By accessing or using our Platform, you acknowledge that you have read, understood, and agree to be bound by this Agreement.`
            )}
          </p>
          <p className="my-4 font-600">{t(`2. Eligibility`)}</p>
          <p className="my-4">
            {t(
              `2.1 By accessing or using Detrade's Platform,you represent and warrant that you are at least 18 years old and have the legal capacity to enter into this Agreement.`
            )}
          </p>
          <p className="my-4">
            {t(`2.2 You must also comply with all applicable laws and regulations regarding your use of our Platform.`)}
          </p>
          <p className="my-4 font-600">{t('3.Account Registration')}</p>
          <p className="my-4">
            {t(
              `3.1 In order to access certain features of Detrade's Platform, you may be required to register for an account.`
            )}
          </p>
          <p className="my-4">
            {t(
              `3.2 When registering for an account, you agree to provide accurate, current, and complete information about yourself as prompted by the registration form.`
            )}
          </p>
          <p className="my-4">
            {t(
              `3.3 You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`
            )}
          </p>
          <p className="my-4">
            {t(
              `3.4 Detrade reserves the right to suspend or terminate your account if we believe that you have provided false or misleading information during the registration process or have violated any provision of this Agreement.`
            )}
          </p>
          <p className="my-4 font-600">{t('4. Platform Use')}</p>
          <p className="my-4">
            {t(
              `4.1 Detrade's Platform is provided for informational and educational purposes only.You acknowledge and agree that any information provided on our Platform is not intended as financial advice and should not be relied upon for making investment decisions.`
            )}
          </p>
          <p className="my-4">
            {t(
              `4.2 You are solely responsible for evaluating the risks associated with trading binary options and for determining whether trading on Detrade's Platform is suitable for you.`
            )}
          </p>
          <p className="my-4">
            {t(
              `4.3 You agree to use Detrade's Platform in accordance with all applicable laws and regulations and in a manner that does not infringe upon the rights of others or violate the terms of this Agreement.`
            )}
          </p>
          <p className="my-4 font-600">{t('5.Trading')}</p>
          <p className="my-4">
            {t(
              `5.1 Detrade's Platform allows users to trade binary options on various financial instruments, including but not limited to stocks, currencies, commodities, and indices.`
            )}
          </p>
          <p className="my-4">
            {t(
              `5.2 You acknowledge and agree that trading binary options involves significant risks, including the risk of losing your entire investment.`
            )}
          </p>
          <p className="my-4">
            {t(
              `5.3 You are solely responsible for evaluating the risks associated with each trade and for determining the appropriate investment strategy for your individual circumstances.`
            )}
          </p>
          <p className="my-4">
            {t(
              `5.4 Detrade does not provide any guarantees or assurances regarding the profitability or success of any trade made on our Platform.`
            )}
          </p>
          <p className="my-4 font-600">{t('6. Fees and Charges')}</p>
          <p className="my-4">
            {t(
              `6.1 Detrade may charge fees for certain services or transactions conducted on our Platform. You agree to pay all applicable fees and charges in connection with your use of our Platform.`
            )}
          </p>
          <p className="my-4">
            {t(
              '6.2 Detrade reserves the right to change or modify our fee structure at any time, with or without notice.'
            )}
          </p>
          <p className="my-4 font-600">{t('7. Intellectual Property')}</p>
          <p className="my-4">
            {t(
              `7.1 All content and materials available on Detrade's Platform,including but not limited to text,graphics,logos,images,and software,are the property of Detrade or its licensors and are protected by copyright,trademark,and other intellectual property laws.`
            )}
          </p>
          <p className="my-4">
            {t(
              `7.2 You are granted a limited,non-exclusive,and non-transferable license to access and use Detrade's Platform for your personal and non-commercial use only.`
            )}
          </p>
          <p className="my-4">
            {t(
              `7.3 You agree not to reproduce, modify, distribute, or create derivative works based on any content or materials available on Detrade's Platform without the express written consent of Detrade.`
            )}
          </p>
          <p className="my-4 font-600">{t('8.Privacy Policy')}</p>
          <p className="my-4">
            {t(
              `8.1 Detrade respects the privacy of its users and is committed to protecting their personal information.Please refer to our Privacy Policy for details on how we collect,use,and disclose your personal information.`
            )}
          </p>
          <p className="my-4 font-600">{t('9.Termination')}</p>
          <p className="my-4">
            {t(
              `9.1 Detrade reserves the right to suspend or terminate your access to our Platform at any time and for any reason,with or without cause,and without prior notice.`
            )}
          </p>
          <p className="my-4">
            {t(
              `9.2 Upon termination of your access to Detrade's Platform, all provisions of this Agreement that by their nature should survive termination will survive, including but not limited to provisions regarding intellectual property, limitation of liability, and dispute resolution.`
            )}
          </p>
          <p className="my-4 font-600">{t('10. Limitation of Liability')}</p>
          <p className="my-4">
            {t(
              `10.1 To the fullest extent permitted by law, Detrade shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with your use of our Platform.`
            )}
          </p>
          <p className="my-4">
            {t(
              `10.2 In no event shall Detrade's total liability to you for all damages,losses,and causes of action arising out of or in connection with this Agreement exceed the amount paid by you,if any,to Detrade during the twelve(12)month period immediately preceding the event giving rise to such liability.`
            )}
          </p>
          <p className="my-4 font-600">{t('11.Indemnification')}</p>
          <p className="my-4">
            {t(
              `11.1 You agree to indemnify,defend,and hold harmless Detrade and its affiliates,officers,directors,employees,and agents from and against any and all claims,liabilities,damages,losses,costs,expenses,or fees(including reasonable attorneys' fees) arising out of or in connection with your use of Detrade's Platform or your breach of this Agreement.`
            )}
          </p>
          <p className="my-4 font-600">{t('12.Governing Law and Dispute Resolution')}</p>
          <p className="my-4">
            {t(`12.1 This Agreement shall be governed by and construed in accordance with the laws of[Jurisdiction].`)}
          </p>
          <p className="my-4">
            {t(
              `12.2 Any disputes arising out of or in connection with this Agreement shall be resolved through arbitration in accordance with the rules of[Arbitration Organization].`
            )}
          </p>
          <p className="my-4 font-600">{t('13.Amendments to the Agreement')}</p>
          <p className="my-4">
            {t(
              `13.1 Detrade reserves the right to modify or amend this Agreement at any time.Any changes will be effective immediately upon posting on Detrade's Platform.`
            )}
          </p>
          <p className="my-4">
            {t(
              `13.2 It is your responsibility to review this Agreement periodically to stay informed of any updates or changes. Your continued use of Detrade's Platform after any modifications to this Agreement constitutes acceptance of those changes.`
            )}
          </p>
          <p className="my-4 font-600">{t('14.Contact Information')}</p>
          <p className="my-4">
            {t(
              `14.1 If you have any questions,concerns,or feedback regarding this Agreement or Detrade's Platform, please contact us at14.1 If you have any questions,concerns,or feedback regarding this Agreement or Detrade's Platform, please contact us at`
            )}
            <span className="underline font-600">[support@detrade.com]</span>.
          </p>
          <p className="my-4">
            {t(
              `By accessing or using Detrade's Platform,you acknowledge that you have read,understood,and agree to be bound by this Agreement.If you do not agree with any part of this Agreement,you must not use Detrade's Platform.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserAgreement;
