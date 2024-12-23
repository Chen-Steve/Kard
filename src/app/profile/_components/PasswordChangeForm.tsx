import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Icon } from '@iconify/react';
import { validatePassword, validatePasswordMatch, ValidationResult } from '../../../utils/validation';
interface PasswordChangeFormProps {
  onCancel: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
}

const PasswordChangeForm = ({ onCancel, onSubmit }: PasswordChangeFormProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [matchValidation, setMatchValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isTyping) {
        setValidation(validatePassword(newPassword));
        setMatchValidation(validatePasswordMatch(newPassword, confirmPassword));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newPassword, confirmPassword, isTyping]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setIsTyping(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setIsTyping(true);
  };

  const handleSubmit = () => {
    const passwordValidation = validatePassword(newPassword);
    const matchValidation = validatePasswordMatch(newPassword, confirmPassword);

    setValidation(passwordValidation);
    setMatchValidation(matchValidation);

    if (passwordValidation.isValid && matchValidation.isValid) {
      onSubmit(newPassword);
    }
  };

  const renderValidationErrors = (validation: ValidationResult) => {
    if (!isTyping || validation.isValid) return null;

    return (
      <div className="mt-2">
        {validation.errors.map((error, index) => (
          <p key={index} className="text-red-500 text-sm">
            {error}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="New password"
            className={`pr-10 bg-white dark:bg-gray-600 text-black dark:text-white ${
              !validation.isValid && isTyping ? 'border-red-500' : ''
            }`}
          />
          <button
            aria-label="Toggle password visibility"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Icon 
              icon={showPassword ? "pepicons-print:eye-closed" : "pepicons-print:eye"} 
              className="text-gray-400"
              width="20"
              height="20"
            />
          </button>
        </div>
        {renderValidationErrors(validation)}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm new password"
            className={`pr-10 bg-white dark:bg-gray-600 text-black dark:text-white ${
              !matchValidation.isValid && isTyping ? 'border-red-500' : ''
            }`}
          />
          <button
            aria-label="Toggle password visibility"
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Icon 
              icon={showConfirmPassword ? "pepicons-print:eye-closed" : "pepicons-print:eye"} 
              className="text-gray-400"
              width="20"
              height="20"
            />
          </button>
        </div>
        {renderValidationErrors(matchValidation)}
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={handleSubmit}
          className="flex-1"
          disabled={!validation.isValid || !matchValidation.isValid}
        >
          Change Password
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PasswordChangeForm;