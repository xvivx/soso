import { useTranslation } from 'react-i18next';

const AML = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mx-auto py-20" style={{ maxWidth: 1200 }}>
        <div
          className="p-2.5 text-18 font-700"
          style={{
            borderLeft: '14px solid #828282',
          }}
        >
          {t(`Anti-Money Laundering (AML) and Know Your Customer (KYC) Policy`)}
        </div>
        <div className="p-4">
          <p className="font-600 my-4">{t(`1.Introduction`)}</p>
          <p className="my-4">
            {t(
              `1.1 Detrade("we","us",or"our")is committed to combating money laundering and terrorist financing activities through the implementation of robust Anti-Money Laundering(AML)and Know Your Customer(KYC)policies and procedures.`
            )}
          </p>
          <p className="my-4">
            {t(
              `1.2 This Anti-Money Laundering(AML)and Know Your Customer(KYC)Policy("Policy")outlines our obligations and procedures for verifying the identity of our traders("you"or"trader")and detecting and preventing money laundering and terrorist financing activities on Detrade's platform.`
            )}
          </p>
          <p className="font-600 my-4">{t(`2. Definitions`)}</p>
          <p className="my-4">
            {t(
              `2.1 "AML" refers to Anti-Money Laundering, which is the set of procedures, laws, and regulations designed to prevent the illegal generation of income through financial systems.`
            )}
          </p>
          <p className="my-4">
            {t(
              `2.2 "KYC" refers to Know Your Customer, which is the process of verifying the identity of customers and assessing their potential risk of involvement in illegal activities.`
            )}
          </p>
          <p className="font-600 my-4">{t(`3. Customer Due Diligence (CDD)`)}</p>
          <p className="my-4">
            {t(
              `3.1 Detrade conducts Customer Due Diligence (CDD) on all users to verify their identity and assess their risk level.`
            )}
          </p>
          <p className="my-4">
            {t(
              `3.2 During the registration process, you may be required to provide certain personal information, including but not limited to your full name, date of birth, residential address, government-issued identification, and proof of address.`
            )}
          </p>
          <p className="my-4">
            {t(
              `3.3 Detrade reserves the right to request additional information or documentation from you to verify your identity or assess your risk level.`
            )}
          </p>
          <p className="my-4">
            {t(
              `3.4 You agree to promptly provide any information or documentation requested by Detrade for the purpose of Customer Due Diligence (CDD).`
            )}
          </p>
          <p className="font-600 my-4">{t(`4. Identity Verification`)}</p>
          <p className="my-4">
            {t(
              `4.1 Detrade uses various methods and tools to verify the identity of its users, including but not limited to:`
            )}
          </p>
          <p className="my-4">
            {t(
              `a) Document verification: Users may be required to upload copies of government-issued identification documents, such as a passport, driver's license,or national ID card.`
            )}
          </p>
          <p className="my-4">
            {t(
              `b) Address verification: Users may be required to provide proof of address, such as a utility bill or bank statement, to verify their residential address.`
            )}
          </p>
          <p className="my-4">
            {t(
              `c) Biometric verification: Detrade may use biometric authentication methods, such as facial recognition or fingerprint scanning, to verify the identity of users.`
            )}
          </p>
          <p className="my-4">
            {t(
              `4.2 Detrade reserves the right to reject any document or information provided by users if it is deemed insufficient or inaccurate for the purpose of identity verification.`
            )}
          </p>
          <p className="font-600 my-4">{t(`5. Risk Assessment`)}</p>
          <p className="my-4">
            {t(
              `5.1 Detrade conducts a risk assessment of each trader based on their identity verification information, transaction history, and other relevant factors.`
            )}
          </p>
          <p className="my-4">
            {t(
              `5.2 Users may be assigned a risk rating based on the results of the risk assessment, which may influence the level of scrutiny applied to their transactions and account activity.`
            )}
          </p>
          <p className="font-600 my-4">{t(`6. Monitoring and Reporting`)}</p>
          <p className="my-4">
            {t(
              `6.1 Detrade monitors trader transactions and account activity for signs of suspicious or unusual behavior that may indicate money laundering or terrorist financing activities.`
            )}
          </p>
          <p className="my-4">
            {t(
              `6.2 If Detrade identifies any suspicious activity or transactions, we reserve the right to report such activity to the relevant authorities and take appropriate action, including but not limited to freezing or suspending trader accounts.`
            )}
          </p>
          <p className="font-600 my-4">{t(`7. Record-Keeping`)}</p>
          <p className="my-4">
            {t(
              `7.1 Detrade maintains records of all trader identification and transaction information in accordance with applicable laws and regulations.`
            )}
          </p>
          <p className="my-4">
            {t(
              `7.2 User records are kept confidential and are only disclosed to authorized personnel or regulatory authorities as required by law.`
            )}
          </p>
          <p className="font-600 my-4">{t(`8. Training and Awareness`)}</p>
          <p className="my-4">
            {t(
              `8.1 Detrade provides training and awareness programs for its employees to ensure they are knowledgeable about AML and KYC policies and procedures.`
            )}
          </p>
          <p className="my-4">
            {t(
              `8.2 Employees are trained to recognize and report suspicious activity and to comply with all AML and KYC requirements.`
            )}
          </p>
          <p className="font-600 my-4">{t(`9. Compliance Oversight`)}</p>
          <p className="my-4">
            {t(
              `9.1 Detrade has designated a Compliance Officer responsible for overseeing compliance with AML and KYC policies and procedures.`
            )}
          </p>
          <p className="my-4">
            {t(
              `9.2 The Compliance Officer is responsible for monitoring regulatory developments, updating AML and KYC policies as necessary, and ensuring that Detrade's operations remain compliant with all applicable laws and regulations.`
            )}
          </p>
          <p className="font-600 my-4">{t(`10. Amendments to the Policy`)}</p>
          <p className="my-4">
            {t(
              `10.1 Detrade reserves the right to modify or amend this Policy at any time. Any changes will be effective immediately upon posting on Detrade's platform.`
            )}
          </p>
          <p className="my-4">
            {t(
              `10.2 It is your responsibility to review this Policy periodically to stay informed of any updates or changes. Your continued use of Detrade's platform after any modifications to this Policy constitutes acceptance of those changes.`
            )}
          </p>
          <p className="font-600 my-4">{t(`11. Contact Information`)}</p>
          <p className="my-4">
            {t(
              `11.1 If you have any questions, concerns, or feedback regarding this Policy or Detrade's AML and KYC procedures, please contact us at [support@detrade.com].`
            )}
          </p>
          <p className="my-4">
            {t(
              `By accessing or using Detrade's platform, you acknowledge that you have read, understood, and agree to comply with this AML and KYC Policy. If you do not agree with any part of this Policy, you must not use Detrade's platform.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
export default AML;
