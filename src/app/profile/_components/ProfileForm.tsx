import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface ProfileFormProps {
  isEditing: boolean;
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileForm = ({
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

export default ProfileForm; 