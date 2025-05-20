
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RecentJournals } from "./RecentJournals";
import { MoodOverTime } from "./MoodOverTime";
import { EmotionTags } from "./EmotionTags";
import { JournalPrompts } from "./JournalPrompts";
import { StartReflectionForm } from "./StartReflectionForm";
import { Separator } from "./ui/separator";
import { PenLine, BarChart3, BookOpen, MessageCircle } from "lucide-react";
import { supabase } from '../integrations/supabase/client';
import { useToast } from "../hooks/use-toast";

export const Dashboard = () => {
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<{ first_visited?: boolean } | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        // Fetch user profile to check first_visited flag
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_visited')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.code !== 'PGRST116') {
            throw profileError;
          }
        }
        
        // Set profile data if available
        if (profileData) {
          setUserProfile(profileData);
          
          // Check if this is the user's first visit
          if (profileData.first_visited === null || profileData.first_visited === undefined) {
            setWelcomeVisible(true);
            
            // Update profile to mark that they've visited
            try {
              await supabase
                .from('profiles')
                .update({ first_visited: true })
                .eq('id', session.user.id);
            } catch (updateError) {
              console.error('Error updating first_visited flag:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('Error in dashboard setup:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "There was a problem loading your profile. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserStatus();
  }, [navigate, toast]);

  const handleStartJournal = () => {
    navigate('/journal/new');
  };

  const handleDismissWelcome = () => {
    setWelcomeVisible(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {welcomeVisible && (
        <Card className="mb-8 bg-primary/10 border-primary/20 shadow-md animate-fade-in">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Welcome to MirrorMind</h2>
            <p className="text-muted-foreground mb-4">
              Your journey of self-reflection and personal growth starts here. MirrorMind helps you track your emotions, 
              gain insights from your journaling, and build a deeper understanding of yourself over time.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <Button onClick={handleStartJournal} className="flex items-center">
                <PenLine className="mr-2 h-4 w-4" />
                Start Journaling
              </Button>
              <Button variant="outline" onClick={handleDismissWelcome}>
                Explore Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Start Reflecting</h2>
            <StartReflectionForm />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4" 
                onClick={() => navigate('/journal/new')}
              >
                <PenLine className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">New Journal Entry</div>
                  <div className="text-sm text-muted-foreground">Capture your thoughts</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4" 
                onClick={() => navigate('/insights')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">View Insights</div>
                  <div className="text-sm text-muted-foreground">Analyze your patterns</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4" 
                onClick={() => navigate('/journal')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Journal History</div>
                  <div className="text-sm text-muted-foreground">Review past entries</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4" 
                onClick={() => navigate('/chat')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Companion Chat</div>
                  <div className="text-sm text-muted-foreground">Reflect with AI</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full mb-8">
        <TabsList className="mb-4 w-full max-w-md mx-auto grid grid-cols-3">
          <TabsTrigger value="recent">Recent Journals</TabsTrigger>
          <TabsTrigger value="mood">Mood Tracker</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Journal Entries</h2>
              <RecentJournals />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mood" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Mood Over Time</h2>
              <MoodOverTime />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emotions" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Common Emotions</h2>
              <EmotionTags />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Journaling Prompts</h2>
          <Separator className="mb-4" />
          <JournalPrompts />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
