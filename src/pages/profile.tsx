import { useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import UserAvatar from '../components/profile/UserAvatar';
import StatsContainer from '../components/profile/stats-container';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FaArrowLeft, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaShuffle } from "react-icons/fa6";
import { toast, useToast } from '../components/ui/use-toast'; 
import { Toaster } from '../components/ui/toaster'; 
import { getGlassAvatarSvg } from '../utils/avatar';
import Image from 'next/image';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const router = useRouter();
  const { dismiss } = useToast();
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        // No authenticated session, redirect to sign in
        router.push('/signin');
      }
    };

    getSession();

    // Generate avatar options
    const options = Array.from({ length: 5 }, () => getGlassAvatarSvg(Math.random().toString()));
    setAvatarOptions(options);
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

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

  const handleConfirmSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    console.log('Saving user data:', {
      name: trimmedName,
      email: trimmedEmail,
      avatar_url: selectedAvatar,
    }); // Debugging data to be saved

    // Check if there are any changes
    if (trimmedName === user!.name && trimmedEmail === user!.email && selectedAvatar === user!.avatar_url) {
      setIsEditing(false);
      setIsModalOpen(false);
      return;
    }

    // Save the updated user data
    const { data, error } = await supabase
      .from('users')
      .update({ name: trimmedName, email: trimmedEmail, avatar_url: selectedAvatar })
      .eq('id', user!.id)
      .select();

    if (error) {
      console.error('Error updating user data:', error);
    } else {
      console.log('User data updated successfully:', data); // Debugging successful update
      setUser({ ...user!, name: trimmedName, email: trimmedEmail, avatar_url: selectedAvatar });
      setIsEditing(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Delete Account',
      description: 'Are you sure you want to delete your account? This action cannot be undone.',
      action: (
        <div className="flex space-x-2">
          <Button
            onClick={confirmDeleteAccount}
            variant="destructive"
          >
            Confirm
          </Button>
          <Button
            onClick={() => dismiss()}
            variant="secondary"
          >
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
      if (error) {
        throw error;
      }
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

  const handleAvatarChange = async (newAvatar: string) => {
    // If newAvatar is already a data URL, use it as is
    // Otherwise, convert it to a data URL
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

      if (error) {
        throw error;
      }

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

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both password fields are identical.',
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Password Change Failed',
        description: 'Your password must include at least one uppercase letter, one lowercase letter, one number, and one special character. Please try again.',
      });
    } else {
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      toast({
        title: 'Password Changed Successfully',
        description: 'Your new password has been set.',
      });
    }
  };

  if (!user) return <p className="text-black dark:text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl mb-4">
        <div className="flex justify-between items-center max-w-3xl">
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex items-center text-black dark:bg-gray-700 dark:text-white">
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
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4">
        <StatsContainer 
          joinedAt={user.joined_at} 
          streak={user.streak} 
        />

        {/* Main Profile Container */}
        <Card className="w-full md:w-3/5 bg-white dark:bg-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserAvatar 
                  avatarUrl={selectedAvatar || user?.avatar_url || null}
                  alt="User Avatar"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                <div className="flex space-x-1">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      aria-label={`Avatar option ${index + 1}`}
                      key={index}
                      onClick={() => handleAvatarChange(avatar)}
                      className="w-6 h-6 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 hover:ring-2 hover:ring-black"
                    >
                      <Image
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(avatar)}`}
                        alt={`Avatar option ${index + 1}`}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  <button
                    aria-label="Shuffle Avatar"
                    onClick={() => {
                      const newOptions = Array.from({ length: 5 }, () => getGlassAvatarSvg(Math.random().toString()));
                      setAvatarOptions(newOptions);
                    }}
                    className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 hover:ring-2 hover:ring-black"
                  >
                    <FaShuffle className="text-gray-600 dark:text-gray-300 text-xs" />
                  </button>
                </div>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={handleEdit} className="text-black dark:bg-gray-800 dark:text-white">
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
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
              {!isEditing && (
                <div className="w-full mt-4">
                  {isChangingPassword ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="pr-10 bg-white dark:bg-gray-600 text-black dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <FaEyeSlash className="text-gray-400" />
                          ) : (
                            <FaEye className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="pr-10 bg-white dark:bg-gray-600 text-black dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="text-gray-400" />
                          ) : (
                            <FaEye className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleChangePassword} className="flex-1">
                          Change Password
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsChangingPassword(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }} 
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full flex items-center justify-center text-black dark:bg-gray-800 dark:text-white"
                    >
                      <FaKey className="mr-2" /> Change Password
                    </Button>
                  )}
                </div>
              )}
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
