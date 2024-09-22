import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import UserAvatar from '../components/UserAvatar';
import StatsContainer from '../components/stats-container';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FaArrowLeft } from 'react-icons/fa'; 
import { toast, useToast } from '../components/ui/use-toast'; 
import { Toaster } from '../components/ui/toaster'; 
import { getMicahAvatarSvg } from '../utils/avatar';
import { differenceInDays } from 'date-fns';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { dismiss } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error('No active session found.');
        router.push('/signin');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        userData.avatar_url = getMicahAvatarSvg(userData.email);
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setSelectedAvatar(userData.avatar_url);
        console.log('Fetched user data:', userData);
      }
    };

    getSession();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    console.log('Saving user data:', {
      name: trimmedName,
      email: trimmedEmail,
      avatar_url: selectedAvatar,
    }); // Debugging data to be saved

    // Check if there are any changes
    if (trimmedName === user.name && trimmedEmail === user.email && selectedAvatar === user.avatar_url) {
      setIsEditing(false);
      setIsModalOpen(false);
      return;
    }

    // Save the updated user data
    const { data, error } = await supabase
      .from('users')
      .update({ name: trimmedName, email: trimmedEmail, avatar_url: selectedAvatar })
      .eq('id', user.id)
      .select();

    if (error) {
      console.error('Error updating user data:', error);
    } else {
      console.log('User data updated successfully:', data); // Debugging successful update
      setUser({ ...user, name: trimmedName, email: trimmedEmail, avatar_url: selectedAvatar });
      setIsEditing(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account Deletion',
      description: (
        <span>
          Are you sure you want to delete your account? This action cannot be undone.
        </span>
      ),
      action: (
        <div className="flex space-x-2">
          <button
            onClick={async () => {
              const { error } = await supabase.auth.admin.deleteUser(user.id);
              if (error) {
                console.error('Error deleting account:', error);
                toast({
                  title: 'Error',
                  description: 'There was an error deleting your account. Please try again.',
                });
              } else {
                router.push('/signin');
              }
            }}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
          >
            Confirm
          </button>
          <button
            onClick={() => dismiss()}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      ),
    });
  };

  if (!user) return <p className="text-black dark:text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mb-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex items-center text-black dark:bg-gray-700 dark:text-white">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
      </div>
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
        <StatsContainer 
          joinedAt={user.joined_at} 
          streak={user.streak} 
        />

        {/* Main Profile Container */}
        <Card className="w-full md:w-2/3 bg-white dark:bg-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black dark:text-white">Profile</CardTitle>
              {!isEditing && (
                <Button variant="outline" onClick={handleEdit} className="text-black dark:bg-gray-800 dark:text-white">
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <UserAvatar 
                avatarSvg={selectedAvatar || user.avatar_url} 
                alt="User Avatar" 
                onClick={() => {}}
              />
              <div className="w-full mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full bg-white dark:bg-gray-600 text-black dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-gray-600 dark:text-gray-300">{user.name}</p>
                )}
              </div>
              <div className="w-full mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full bg-white dark:bg-gray-600 text-black dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-gray-600 dark:text-gray-300">{user.email}</p>
                )}
              </div>
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="mr-2 text-black dark:text-white">
                Cancel
              </Button>
              <Button onClick={handleSave} className="text-black bg-gray-400 hover:bg-gray-500 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500">Save</Button>
            </CardFooter>
          )}
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push('/privacy')} 
              className="text-black dark:bg-gray-800 dark:text-white"
            >
              Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeleteAccount} 
              className="text-red-600 dark:bg-gray-800 dark:text-red-400"
            >
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Confirm Changes</h2>
            <p className="text-black dark:text-white">Are you sure you want to save these changes?</p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="mr-2 text-black dark:text-white">
                Cancel
              </Button>
              <Button onClick={handleConfirmSave} className="text-white dark:text-black">Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;