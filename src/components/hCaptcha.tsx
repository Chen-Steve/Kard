import React, { useEffect } from 'react';

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
      if (window.hcaptcha) {
        window.hcaptcha.render('captcha-container', {
          sitekey: siteKey,
          size: 'compact',
          theme: 'light',
          'error-callback': window.onError,
        });
      }
    };

    window.onError = (error: any) => {
      console.error('hCaptcha error:', error);
    };

    // Dynamically load the hCaptcha script if not already present
    const scriptSrc = `https://js.hcaptcha.com/1/api.js?onload=hcaptchaOnLoad&render=explicit&recaptchacompat=off`;
    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.hcaptchaOnLoad) {
          window.hcaptchaOnLoad();
        }
      };
      script.onerror = (error) => {
        console.error('Failed to load hCaptcha script:', error);
      };
      document.body.appendChild(script);
    }
  }, [siteKey]);

  return <div id="captcha-container" className="h-captcha" />;
};

export default Hcaptcha;
