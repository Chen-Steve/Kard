import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export const ProfileHeader = () => {
  const router = useRouter();
  
  return (
    <div className="w-full max-w-3xl mb-4">
      <div className="flex justify-between items-center max-w-3xl">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')} 
          className="dark:bg-gray-700 dark:text-white px-2"
        >
          <Icon icon="pepicons-print:arrow-left" className="text-3xl" />
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.open('https://forms.gle/WpceELe2NcyDoP7J8', '_blank')}
          className="text-black dark:bg-gray-700 dark:text-white sm:mr-9"
        >
          Feedback
        </Button>
      </div>
    </div>
  );
};

// ProfileForm Component
interface ProfileFormProps {
  isEditing: boolean;
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileForm = ({
  isEditing,
  name,
  email,
  onNameChange,
  onEmailChange,
  onSave,
  onCancel
}: ProfileFormProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Username
        </label>
        {isEditing ? (
          <Input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 block w-full bg-white dark:bg-gray-600 text-black dark:text-white"
          />
        ) : (
          <p className="mt-1 text-gray-600 dark:text-gray-300">{name}</p>
        )}
      </div>
      <div className="w-full mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        {isEditing ? (
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="mt-1 block w-full bg-white dark:bg-gray-600 text-black dark:text-white"
          />
        ) : (
          <p className="mt-1 text-gray-600 dark:text-gray-300">{email}</p>
        )}
      </div>
      {isEditing && (
        <div className="flex justify-end w-full mt-4">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="mr-2 text-black dark:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            className="text-black bg-gray-400 hover:bg-gray-500 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

// ProfileFooter Component
interface ProfileFooterProps {
  onDeleteAccount: () => void;
}

export const ProfileFooter = ({ onDeleteAccount }: ProfileFooterProps) => {
  const router = useRouter();
  
  return (
    <div className="flex justify-between w-full">
      <div className="flex-1">
        <Button 
          variant="outline" 
          onClick={() => router.push('/privacy')} 
          className="text-black dark:bg-gray-800 dark:text-white"
        >
          Privacy Policy
        </Button>
      </div>
      <div className="flex justify-end flex-1">
        <Button 
          variant="outline" 
          onClick={onDeleteAccount} 
          className="text-red-600 dark:bg-gray-800 dark:text-red-400"
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}; 