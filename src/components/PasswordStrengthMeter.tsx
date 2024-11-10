import { FC } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    return strength;
  };

  const getStrengthText = (strength: number): string => {
    if (strength === 0) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const strength = calculateStrength(password);
  const strengthText = getStrengthText(strength);
  const strengthColor = getStrengthColor(strength);
  const strengthPercentage = (strength / 5) * 100;

  return (
    <div className="mt-1">
      <div className="h-1 w-full bg-gray-200 rounded-full">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      <p className="text-xs mt-1 text-gray-600">{strengthText}</p>
    </div>
  );
};

export default PasswordStrengthMeter; 