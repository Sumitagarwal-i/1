import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Calendar } from "./ui/calendar";
import { useToast } from "../hooks/use-toast";
import { supabase } from '../integrations/supabase/client';

interface UserSettings {
  user_id: string;
  email_notifications: boolean;
  theme_preference: string;
  language_preference: string;
  reminder_time: string | null;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  current_streak: number | null;
  longest_streak: number | null;
  joined_date: string;
  last_entry_date: string | null;
  bio?: string | null;
  first_visited?: boolean | null;
  intention?: string | null;
}

const defaultSettings: UserSettings = {
  user_id: '',
  email_notifications: true,
  theme_preference: 'system',
  language_preference: 'en',
  reminder_time: null
};

const defaultProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  avatar_url: null,
  current_streak: 0,
  longest_streak: 0,
  joined_date: new Date().toISOString(),
  last_entry_date: null,
  bio: null
};

export const UserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: ''
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate('/auth');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        
        // Fetch user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
        
        // Set the profile state
        setProfile({
          ...defaultProfile,
          ...profileData,
          email: sessionData.session.user.email || ''
        });
        
        // Set the settings state
        setSettings({
          ...defaultSettings,
          ...settingsData,
          user_id: userId
        });
        
        // Set form for editing
        setForm({
          name: profileData?.name || '',
          bio: profileData?.bio || ''
        });
        
        // Set last entry date if available
        if (profileData?.last_entry_date) {
          setSelectedDate(new Date(profileData.last_entry_date));
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "There was a problem loading your profile information. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "There was a problem signing you out. Please try again."
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          bio: form.bio
        })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        name: form.name,
        bio: form.bio
      }));
      
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again."
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile.id,
          email_notifications: settings.email_notifications,
          theme_preference: settings.theme_preference,
          language_preference: settings.language_preference,
          reminder_time: settings.reminder_time
        });
        
      if (error) throw error;
      
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully."
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem saving your settings. Please try again."
      });
    }
  };

  const toggleTheme = (theme: string) => {
    setSettings(prev => ({
      ...prev,
      theme_preference: theme
    }));
  };

  const toggleLanguage = (language: string) => {
    setSettings(prev => ({
      ...prev,
      language_preference: language
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl px-4">
        <div className="h-8 w-48 bg-muted rounded mb-6 animate-pulse"></div>
        <div className="grid gap-6 grid-cols-1">
          <div className="h-64 bg-muted rounded animate-pulse"></div>
          <div className="h-48 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex flex-col items-center space-y-2 md:w-auto w-full">
                <Avatar className="h-24 w-24">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button variant="outline" size="sm" className="mt-2 w-full md:w-auto">
                  Change Avatar
                </Button>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={form.name} 
                        onChange={(e) => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile.email} disabled />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input 
                        id="bio" 
                        value={form.bio || ''} 
                        onChange={(e) => setForm({...form, bio: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button onClick={handleSaveProfile} className="w-full sm:w-auto">Save Changes</Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-1">
                      <Label className="text-sm text-muted-foreground">Name</Label>
                      <p className="font-medium">{profile.name || 'Not set'}</p>
                    </div>
                    
                    <div className="grid gap-1">
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    
                    <div className="grid gap-1">
                      <Label className="text-sm text-muted-foreground">Bio</Label>
                      <p className="font-medium">{profile.bio || 'No bio yet'}</p>
                    </div>
                    
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{profile.current_streak} days</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">{profile.longest_streak} days</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-2xl font-bold">
                  {new Date(profile.joined_date).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Last Journal Entry</p>
                <p className="text-2xl font-bold">
                  {profile.last_entry_date 
                    ? new Date(profile.last_entry_date).toLocaleDateString() 
                    : 'No entries yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="preferences">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Activity Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>User Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email reminders and summaries
                      </p>
                    </div>
                    <Switch 
                      checked={settings.email_notifications} 
                      onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Appearance</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={settings.theme_preference === 'light' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => toggleTheme('light')}
                      className="w-full sm:w-auto"
                    >
                      Light
                    </Button>
                    <Button 
                      variant={settings.theme_preference === 'dark' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => toggleTheme('dark')}
                      className="w-full sm:w-auto"
                    >
                      Dark
                    </Button>
                    <Button 
                      variant={settings.theme_preference === 'system' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => toggleTheme('system')}
                      className="w-full sm:w-auto"
                    >
                      System
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Language</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={settings.language_preference === 'en' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => toggleLanguage('en')}
                      className="w-full sm:w-auto"
                    >
                      English
                    </Button>
                    <Button 
                      variant={settings.language_preference === 'es' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => toggleLanguage('es')}
                      className="w-full sm:w-auto"
                    >
                      Spanish
                    </Button>
                    <Button 
                      variant={settings.language_preference === 'fr' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => toggleLanguage('fr')}
                      className="w-full sm:w-auto"
                    >
                      French
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-start mt-4">
                  <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Activity Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-full overflow-x-auto pb-4">
                    <Calendar
                      mode="multiple"
                      selected={selectedDate ? [selectedDate] : []}
                      onSelect={() => {}} // Read-only
                      className="mx-auto"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-x-2 mt-4 flex-wrap gap-y-2 justify-center">
                    <Badge variant="outline" className="bg-primary/10">Journal Entry</Badge>
                    <Badge variant="outline" className="bg-muted">No Activity</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button variant="outline" onClick={() => navigate('/')} className="w-full sm:w-auto">
            Back to Dashboard
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
