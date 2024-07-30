import React, { useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

declare global {
  interface Window {
    hcaptchaOnLoad: () => void;
    hcaptcha: any; // Adjust the type if you have a more specific type for hcaptcha
    onError: (error: any) => void;
  }
}

type HcaptchaProps = {
  onChange: (token: string | null) => void;
};

const Hcaptcha: React.FC<HcaptchaProps> = ({ onChange }) => {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

  useEffect(() => {
    if (!siteKey) {
      console.error('Missing site key for hCaptcha');
      return;
    }

    window.hcaptchaOnLoad = () => {
      window.hcaptcha.render('captcha-container', {
        sitekey: siteKey,
        size: 'compact',
        theme: 'light',
        'error-callback': window.onError,
      });
    };

    window.onError = (error: any) => {
      console.error('hCaptcha error:', error);
    };

    // Dynamically load the hCaptcha script if not already present
    if (!document.querySelector(`script[src="https://js.hcaptcha.com/1/api.js?onload=hcaptchaOnLoad&render=explicit&recaptchacompat=off"]`)) {
      const script = document.createElement('script');
      script.src = `https://js.hcaptcha.com/1/api.js?onload=hcaptchaOnLoad&render=explicit&recaptchacompat=off`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [siteKey]);

  return <div id="captcha-container" className="h-captcha" />;
};

export default Hcaptcha;
