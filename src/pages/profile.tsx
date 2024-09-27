import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import UserAvatar from '../components/UserAvatar';
import StatsContainer from '../components/profile/stats-container';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FaArrowLeft, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { toast, useToast } from '../components/ui/use-toast'; 
import { Toaster } from '../components/ui/toaster'; 
import { getMicahAvatarSvg } from '../utils/avatar';
import { differenceInDays } from 'date-fns';

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const router = useRouter();
  const { dismiss } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && session.user) {
        // User is authenticated
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
          setIsAnonymous(false);
          setUser(userData);
          setName(userData.name);
          setEmail(userData.email);
          setSelectedAvatar(userData.avatar_url || getMicahAvatarSvg(userData.email));
        }
      } else {
        // Check for anonymous user
        const anonymousUserId = localStorage.getItem('anonymousUserId');
        
        if (anonymousUserId) {
          setIsAnonymous(true);
          const localUserData = JSON.parse(localStorage.getItem('anonymousUserData') || '{}');
          setUser({
            id: anonymousUserId,
            name: localUserData.name || 'Anonymous User',
            email: '',
            avatar_url: localUserData.avatar_url || getMicahAvatarSvg(anonymousUserId),
            streak: localUserData.streak || 0,
            joined_at: localUserData.joined_at || new Date().toISOString(),
          });
          setName(localUserData.name || 'Anonymous User');
          setEmail('');
          setSelectedAvatar(localUserData.avatar_url || getMicahAvatarSvg(anonymousUserId));
        } else {
          // No authenticated session or anonymous user, redirect to sign in
          router.push('/signin');
        }
      }
    };

    getSession();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isAnonymous) {
      const updatedUserData: User = {
        id: user!.id,
        name: name.trim(),
        email: '',
        avatar_url: selectedAvatar,
        streak: user!.streak,
        joined_at: user!.joined_at,
      };
      localStorage.setItem('anonymousUserData', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated locally.',
      });
    } else {
      // For authenticated users
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
              if (isAnonymous) {
                localStorage.removeItem('anonymousUserId');
                localStorage.removeItem('anonymousUserData');
                // Also remove any other related data (e.g., decks)
                localStorage.removeItem('decks_' + user!.id);
                router.push('/');
              } else {
                const { error } = await supabase.auth.admin.deleteUser(user!.id);
                if (error) {
                  console.error('Error deleting account:', error);
                  toast({
                    title: 'Error',
                    description: 'There was an error deleting your account. Please try again.',
                  });
                } else {
                  router.push('/signin');
                }
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

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleAvatarChange = () => {
    if (isAnonymous) {
      const newAvatar = getMicahAvatarSvg(Math.random().toString());
      setSelectedAvatar(newAvatar);
    } else {
      // Existing avatar change logic for authenticated users
    }
  };

  const updateAnonymousStreak = () => {
    const localUserData = JSON.parse(localStorage.getItem('anonymousUserData') || '{}');
    const lastLogin = new Date(localUserData.last_login);
    const today = new Date();
    const daysSinceLastLogin = differenceInDays(today, lastLogin);

    let newStreak = localUserData.streak || 0;
    if (daysSinceLastLogin === 1) {
      newStreak += 1;
    } else if (daysSinceLastLogin > 1) {
      newStreak = 1;
    }

    const updatedUserData = {
      ...localUserData,
      streak: newStreak,
      last_login: today.toISOString(),
    };
    localStorage.setItem('anonymousUserData', JSON.stringify(updatedUserData));
    setUser((prevUser: User | null) => prevUser ? { ...prevUser, streak: newStreak } : null);
  };

  useEffect(() => {
    if (isAnonymous) {
      updateAnonymousStreak();
    }
  }, [isAnonymous]);

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
                onClick={handleAvatarChange}
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
                {isAnonymous ? (
                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={handleSignUp}
                      className="bg-black hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Sign Up
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Sync and save your data
                    </span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
              {!isAnonymous && (
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
            {!isAnonymous && (
              <Button 
                variant="outline" 
                onClick={handleDeleteAccount} 
                className="text-red-600 dark:bg-gray-800 dark:text-red-400"
              >
                Delete Account
              </Button>
            )}
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
      {isAnonymous && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          You are using an anonymous account. Your data is stored locally in your browser.
        </div>
      )}
    </div>
  );
};

export default Profile;