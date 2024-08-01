import crypto from 'crypto';

export const getGravatarUrl = (email: string, size: number = 200): string => {
  const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
};
