import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import UserAvatar from '../components/UserAvatar';
import { getMicahAvatarSvg } from '../utils/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FaArrowLeft } from 'react-icons/fa'; // Import the back arrow icon
import { toast, useToast } from '../components/ui/use-toast'; // Import toast components
import { Toaster } from '../components/ui/toaster'; // Import Toaster component

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
        userData.avatarUrl = getMicahAvatarSvg(userData.email);
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
      }
    };

    getSession();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Check if there are any changes
    if (trimmedName === user.name && trimmedEmail === user.email) {
      setIsEditing(false);
      return;
    }

    // Save the updated user data
    const { error } = await supabase
      .from('users')
      .update({ name: trimmedName, email: trimmedEmail })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user data:', error);
    } else {
      setUser({ ...user, name: trimmedName, email: trimmedEmail });
      setIsEditing(false);
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
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      ),
    });
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile</CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <UserAvatar avatarSvg={user.avatarUrl} alt="User Avatar" />
            <div className="w-full mt-4">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              {isEditing ? (
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full"
                />
              ) : (
                <p className="mt-1 text-gray-600">{user.name}</p>
              )}
            </div>
            <div className="w-full mt-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full"
                />
              ) : (
                <p className="mt-1 text-gray-600">{user.email}</p>
              )}
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </CardFooter>
        )}
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={handleDeleteAccount} className="mr-2 text-red-600">
            Delete Account
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
};

export default Profile;
