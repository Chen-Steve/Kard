import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast, useToast } from '../components/ui/use-toast'; 
import { Toaster } from '../components/ui/toaster'; 
import { getGlassAvatarSvg } from '../utils/avatar';

import UserAvatar from '../components/profile/UserAvatar';
import StatsContainer from '../components/profile/stats-container';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileForm from '../components/profile/ProfileForm';
import ProfileFooter from '../components/profile/ProfileFooter';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  streak: number;
  joined_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const router = useRouter();
  const { dismiss } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && session.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          toast({
            title: 'Error',
            description: 'Failed to load user data. Please try again.',
          });
        } else {
          setUser(userData);
          setName(userData.name);
          setEmail(userData.email);
          setSelectedAvatar(userData.avatar_url || getGlassAvatarSvg(userData.email));
        }
      } else {
        router.push('/signin');
      }
    };

    getSession();
    
    // Generate initial avatar options
    const options = Array.from({ length: 5 }, () => getGlassAvatarSvg(Math.random().toString()));
    setAvatarOptions(options);
  }, [router]);

  const handleSave = async () => {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        name: name.trim(), 
        email: email.trim(), 
        avatar_url: selectedAvatar 
      })
      .eq('id', user!.id)
      .select();

    if (error) {
      console.error('Error updating user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    } else {
      setUser(data[0]);
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    }
  };

  const handleAvatarChange = async (newAvatar: string) => {
    const avatarUrl = newAvatar.startsWith('data:') 
      ? newAvatar 
      : `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(newAvatar)))}`;

    setSelectedAvatar(avatarUrl);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      setUser({ ...user!, avatar_url: avatarUrl });
      toast({
        title: 'Avatar Updated',
        description: 'Your avatar has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Password Change Failed',
        description: 'Failed to update password. Please try again.',
      });
    } else {
      setIsChangingPassword(false);
      toast({
        title: 'Password Changed Successfully',
        description: 'Your new password has been set.',
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Delete Account',
      description: 'Are you sure you want to delete your account? This action cannot be undone.',
      action: (
        <div className="flex space-x-2">
          <Button onClick={confirmDeleteAccount} variant="destructive">
            Confirm
          </Button>
          <Button onClick={() => dismiss()} variant="secondary">
            Cancel
          </Button>
        </div>
      ),
      duration: 5000,
    });
  };

  const confirmDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user!.id);
      if (error) throw error;
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted.',
      });
      router.push('/signin');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting your account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) return <p className="text-black dark:text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex flex-col items-center justify-center p-4">
      <ProfileHeader />
      
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4">
        <StatsContainer 
          joinedAt={user.joined_at} 
          streak={user.streak} 
        />

        <Card className="w-full md:w-3/5 bg-white dark:bg-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <UserAvatar 
                avatarUrl={selectedAvatar}
                alt={user.name}
                showOptions={true}
                onAvatarChange={handleAvatarChange}
                avatarOptions={avatarOptions}
                setAvatarOptions={setAvatarOptions}
              />
              {!isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="text-black dark:bg-gray-800 dark:text-white"
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <ProfileForm 
              isEditing={isEditing}
              name={name}
              email={email}
              onNameChange={setName}
              onEmailChange={setEmail}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
            
            {!isEditing && (
              <div className="w-full mt-4">
                {isChangingPassword ? (
                  <PasswordChangeForm
                    onCancel={() => setIsChangingPassword(false)}
                    onSubmit={handleChangePassword}
                  />
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full text-black dark:bg-gray-800 dark:text-white"
                  >
                    Change Password
                  </Button>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <ProfileFooter onDeleteAccount={handleDeleteAccount} />
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default Profile;