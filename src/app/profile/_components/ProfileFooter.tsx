import { Button } from '../../../components/ui/Button';
import { useRouter } from 'next/navigation';

interface ProfileFooterProps {
  onDeleteAccount: () => void;
}

const ProfileFooter = ({ onDeleteAccount }: ProfileFooterProps) => {
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

export default ProfileFooter; 