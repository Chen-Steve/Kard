import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

type HcaptchaProps = {
  onChange: (token: string | null) => void;
};

const Hcaptcha: React.FC<HcaptchaProps> = ({ onChange }) => {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

  return (
    <HCaptcha
      sitekey={siteKey}
      onVerify={onChange}
    />
  );
};

export default Hcaptcha;
