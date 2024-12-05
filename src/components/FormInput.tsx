import { ChangeEvent } from 'react';
import { Icon } from '@iconify/react';

interface FormInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  error?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const FormInput = ({
  id,
  type,
  value,
  onChange,
  label,
  required = false,
  error = false,
  showPasswordToggle = false,
  showPassword,
  onTogglePassword,
}: FormInputProps) => {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className={`block px-3 py-2 w-full text-base bg-gray-50 border rounded-md 
                   appearance-none focus:outline-none focus:ring-1 focus:ring-black
                   peer ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      <label
        htmlFor={id}
        className="absolute text-base text-gray-500 duration-300 transform 
                 -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-50 px-2 
                 peer-focus:px-2 peer-placeholder-shown:scale-100 
                 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 
                 peer-focus:text-black left-1"
      >
        {label}
      </label>
      {showPasswordToggle && (
        <div
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <Icon icon="pepicons-print:eye" />
          ) : (
            <Icon icon="pepicons-print:eye-closed" />
          )}
        </div>
      )}
    </div>
  );
};

export default FormInput; 