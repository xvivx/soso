import { useTranslation } from 'react-i18next';

function PrivacyPolicy() {
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
          {t(`Privacy Policy`)}
        </div>
        <div className="p-.25">
          <p className="my-4">
            {t(
              `Detrade ("we," "us," or "our") values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our binary options trading platform ("Platform"). By accessing or using our Platform, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, you must not use our Platform.`
            )}
          </p>
          <p className="my-4 font-600">{t(`1. Information We Collect`)}</p>
          <p className="my-4">
            {t(`We collect several types of information from and about users of our Platform, including:`)}
          </p>
          <p className="my-4">{t(`1.1 Personal Identification Information:`)}</p>
          <p className="my-4">
            {t(
              `This includes your name, email address, telephone number, postal address, date of birth, and any other information you provide when registering for an account or using our services.`
            )}
          </p>
          <p className="my-4">{t(`1.2 Financial Information:`)}</p>
          <p className="my-4">
            {t(
              `We may collect financial information such as bank account numbers, credit card details, and transaction history to facilitate transactions and comply with regulatory requirements.`
            )}
          </p>
          <p className="my-4">{t(`1.3 Technical Information:`)}</p>
          <p className="my-4">
            {t(
              `This includes your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing our Platform.`
            )}
          </p>
          <p className="my-4">{t(`1.4 Usage Data:`)}</p>
          <p className="my-4">
            {t(
              `We collect information about your activity on our Platform, including trading activity, preferences, and engagement with our content.`
            )}
          </p>
          <p className="my-4">{t(`1.5 Location Information:`)}</p>
          <p className="my-4">
            {t(
              `We may collect information about your location if you permit us to do so, using technologies such as GPS, Wi-Fi, or cell tower data.`
            )}
          </p>
          <p className="my-4">{t(`1.6 Cookies and Tracking Technologies:`)}</p>
          <p className="my-4">
            {t(
              `We use cookies, web beacons, and other tracking technologies to collect information about your use of our Platform and to enhance your trader experience.`
            )}
          </p>
          <p className="my-4 font-600">{t(`2. How We Use Your Information`)}</p>
          <p className="my-4">{t(`We use the information we collect for various purposes, including:`)}</p>
          <p className="my-4">{t(`2.1 To Provide and Maintain Our Platform:`)}</p>
          <p className="my-4">
            {t(`To manage your account, process transactions, and provide you with the services you request.`)}
          </p>
          <p className="my-4">{t(`2.2 To Improve Our Platform:`)}</p>
          <p className="my-4">
            {t(
              `To understand how users interact with our Platform, diagnose technical issues, and enhance the functionality and trader experience.`
            )}
          </p>
          <p className="my-4">{t(`2.3 To Communicate with You:`)}</p>
          <p className="my-4">
            {t(
              `To send you updates, security alerts, and administrative messages, and to respond to your inquiries and requests.`
            )}
          </p>
          <p className="my-4">{t(`2.4 To Personalize Your Experience:`)}</p>
          <p className="my-4">{t(`To tailor our content and advertisements to your interests and preferences.`)}</p>
          <p className="my-4">{t(`2.5 To Conduct Analytics and Research:`)}</p>
          <p className="my-4">{t(`To analyze trends, monitor usage, and conduct research to improve our services.`)}</p>
          <p className="my-4">{t(`2.6 To Ensure Security and Compliance:`)}</p>
          <p className="my-4">
            {t(
              `To monitor for fraud, enforce our terms of service, and comply with legal and regulatory requirements.`
            )}
          </p>
          <p className="my-4 font-600">{t(`3. How We Share Your Information`)}</p>
          <p className="my-4">
            {t(`We may share your information with third parties in the following circumstances:`)}
          </p>
          <p className="my-4">{t(`3.1 With Service Providers:`)}</p>
          <p className="my-4">
            {t(
              `We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and hosting services.`
            )}
          </p>
          <p className="my-4">{t(`3.2 For Legal Reasons:`)}</p>
          <p className="my-4">
            {t(
              `We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).`
            )}
          </p>
          <p className="my-4">{t(`3.3 To Protect Our Rights:`)}</p>
          <p className="my-4">
            {t(
              `We may disclose your information to protect the rights, property, or safety of Detrade, our users, or others, and to enforce our terms and conditions.`
            )}
          </p>
          <p className="my-4">{t(`3.4 With Your Consent:`)}</p>
          <p className="my-4">
            {t(`We may share your information with third parties if you provide your consent to do so.`)}
          </p>
          <p className="my-4">{t(`3.5 In Business Transfers:`)}</p>
          <p className="my-4">
            {t(
              `We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.`
            )}
          </p>
          <p className="my-4 font-600">{t(`4. Your Data Protection Rights`)}</p>
          <p className="my-4">
            {t(`Depending on your location, you may have the following rights regarding your personal information:`)}
          </p>
          <p className="my-4">{t(`4.1 Access:`)}</p>
          <p className="my-4">
            {t(`You have the right to request a copy of the personal information we hold about you.`)}
          </p>
          <p className="my-4">{t(`4.2 Correction:`)}</p>
          <p className="my-4">
            {t(`You have the right to request that we correct any inaccuracies in your personal information.`)}
          </p>
          <p className="my-4">{t(`4.3 Deletion:`)}</p>
          <p className="my-4">
            {t(
              `You have the right to request that we delete your personal information, subject to certain exceptions.`
            )}
          </p>
          <p className="my-4">{t(`4.4 Objection:`)}</p>
          <p className="my-4">
            {t(
              `You have the right to object to our processing of your personal information, under certain conditions.`
            )}
          </p>
          <p className="my-4">
            {t(
              `4.5 Restriction: You have the right to request that we restrict the processing of your personal information,under certain conditions.`
            )}
          </p>
          <p className="my-4">
            {t(
              `4.6 Data Portability: You have the right to request the transfer of your personal information to another organization or directly to you, under certain conditions.`
            )}
          </p>
          <p className="my-4">
            {t(
              `4.7 Withdraw Consent: If you have given us consent to process your personal information, you have the right to withdraw your consent at any time.`
            )}
          </p>
          <p className="my-4 font-600">{t(`5. Data Security`)}</p>
          <p className="my-4">
            {t(
              `We implement a variety of security measures to protect your personal information from unauthorized access, use, or disclosure. These measures include encryption, access controls, and secure storage. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.`
            )}
          </p>
          <p className="my-4 font-600">{t(`6. Data Retention`)}</p>
          <p className="my-4">
            {t(
              `We will retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to comply with legal, regulatory, or business requirements.`
            )}
          </p>
          <p className="my-4 font-600">{t(`7. Cookies and Similar Technologies`)}</p>
          <p className="my-4">
            {t(
              `7.1 Cookies: We use cookies to enhance your experience on our Platform. A cookie is a small file placed on your device that allows us to recognize your browser and capture and remember certain information.`
            )}
          </p>
          <p className="my-4">
            {t(
              `7.2 Types of Cookies: a) **Essential Cookies**: These cookies are necessary for the operation of our Platform. They enable you to navigate the site and use its features.`
            )}
          </p>
          <p className="my-4">
            {t(
              `b) **Performance Cookies**: These cookies collect information about how you use our Platform, such as which pages you visit most often. This information is used to improve the functionality of our Platform.`
            )}
          </p>
          <p className="my-4">
            {t(
              `c) **Functional Cookies**: These cookies allow our Platform to remember choices you make (such as your username, language, or region) and provide enhanced, more personal features.`
            )}
          </p>
          <p className="my-4">
            {t(
              `d) **Targeting/Advertising Cookies**: These cookies are used to deliver advertisements that are more relevant to you and your interests. They also help us measure the effectiveness of advertising campaigns.`
            )}
          </p>
          <p className="my-4">
            {t(
              `7.3 Managing Cookies: You can control the use of cookies at the individual browser level. If you reject cookies, you may still use our Platform, but your ability to use some features or areas of our Platform may be limited.`
            )}
          </p>
          <p className="my-4 font-600">{t(`8. Third-Party Links`)}</p>
          <p className="my-4">
            {t(
              `Our Platform may contain links to third-party websites or services that are not owned or controlled by Detrade. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We encourage you to review the privacy policies of any third-party websites you visit.`
            )}
          </p>
          <p className="my-4 font-600">{t(`9. Children's Privacy`)}</p>
          <p className="my-4">
            {t(
              `Our Platform is not intended for use by children under the age of 18. We do not knowingly collect or solicit personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will delete that information as quickly as possible.`
            )}
          </p>
          <p className="my-4 font-600">{t(`10. International Data Transfers`)}</p>
          <p className="my-4">
            {t(
              `Your information, including personal information, may be transferred to and maintained on servers or databases located outside of your country or jurisdiction. By using our Platform, you consent to the transfer of your information to the United States or any other country in which Detrade or its service providers maintain facilities.`
            )}
          </p>
          <p className="my-4 font-600">11. Changes to This Privacy Policy</p>
          <p className="my-4">
            {t(
              `Detrade reserves the right to update or change this Privacy Policy at any time. We will notify you of any changes by posting the new Privacy Policy on our Platform. You are advised to review this Privacy Policy periodically for any changes. Your continued use of our Platform after any modifications to the Privacy Policy will constitute your acknowledgment of the modifications and your consent to abide and be bound by the updated Privacy Policy.`
            )}
          </p>
          <p className="my-4 font-600">{t(`12. Contact Us`)}</p>
          <p className="my-4">
            {t(`If you have any questions about this Privacy Policy, please contact us at`)}
            <span className="underline font-600">[support@detrade.com]</span>.
          </p>
          <p className="my-4">
            {t(
              `By accessing or using Detrade's Platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with this Privacy Policy, you must not use our Platform.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
export default PrivacyPolicy;
