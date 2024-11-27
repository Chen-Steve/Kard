import { Button } from '../ui/Button';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

const ProfileHeader = () => {
  const router = useRouter();
  
  return (
    <div className="w-full max-w-3xl mb-4">
      <div className="flex justify-between items-center max-w-3xl">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')} 
          className=" dark:bg-gray-700 dark:text-white px-2"
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

export default ProfileHeader; 