import { Button } from '../ui/Button';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';

const ProfileHeader = () => {
  const router = useRouter();
  
  return (
    <div className="w-full max-w-3xl mb-4">
      <div className="flex justify-between items-center max-w-3xl">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')} 
          className="flex items-center text-black dark:bg-gray-700 dark:text-white"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
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

export default ProfileHeader; 