
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import { supabase } from '../integrations/supabase/client';
import { useToast } from "../hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;  // Changed from Date to string for JSON serialization
}

// Initialize with some predefined messages
const initialBotMessages = [
  "Hello there! I'm your MirrorMind companion. How are you feeling today?",
  "I notice you seem thoughtful today. Would you like to talk about it?",
  "It sounds like you've had quite a day. Would you like to reflect on what went well?",
  "I'm here to listen and help you process your thoughts. What's on your mind?",
  "Sometimes putting our feelings into words can help us understand them better. What are you experiencing right now?",
  "Every emotion has something to teach us. What do you think yours is telling you today?",
  "I'm curious to hear more about that. Could you tell me what led to this feeling?",
  "Thank you for sharing that with me. How long have you been feeling this way?",
  "That's really insightful! Have you noticed any patterns in when these thoughts come up?",
  "It takes courage to look inward like this. What would be helpful for you right now?"
];

// Different kinds of responses for variety
const followUpResponses = [
  "That's really interesting. Can you tell me more about that?",
  "I understand. How did that make you feel?",
  "Thank you for sharing. What do you think triggered that?",
  "I see. Have you noticed this happening before?",
  "That sounds challenging. How have you been coping with it?",
  "I appreciate you opening up. What would help you feel better right now?",
  "I'm here for you. Is there something specific you'd like to focus on today?",
  "That's a good observation. What patterns have you noticed around this?",
  "It sounds like you've been thinking about this a lot. What insights have you gained?",
  "I'm curious - how might you approach this differently next time?"
];

const supportiveResponses = [
  "It's completely normal to feel that way. Many people have similar experiences.",
  "You're doing great by acknowledging these feelings. That's an important first step.",
  "Remember that emotions are temporary - they come and go like waves.",
  "It's okay to not have all the answers right now. Being patient with yourself is important.",
  "You've shown a lot of self-awareness in our conversation today.",
  "I notice how thoughtful you are about your experiences. That's a valuable quality.",
  "Small steps forward are still progress. Be proud of each one.",
  "Consider this a journey of self-discovery. Each insight is valuable.",
  "Your willingness to reflect shows real emotional intelligence.",
  "Remember to be as kind to yourself as you would be to a good friend."
];

const CompanionChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        loadPreviousConversation(data.session.user.id);
      }
    };
    
    fetchSession();
  }, []);

  useEffect(() => {
    // If no messages, add the initial greeting
    if (messages.length === 0) {
      const randomGreeting = initialBotMessages[Math.floor(Math.random() * initialBotMessages.length)];
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: randomGreeting,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const loadPreviousConversation = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_recent_conversation', { user_id_input: userId });
      
      if (error) throw error;
      
      if (data && data.length > 0 && data[0].messages) {
        // Convert the JSON messages from the database to Message type
        const storedMessages = data[0].messages as any[];
        const typedMessages: Message[] = storedMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        setMessages(typedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const saveConversation = async () => {
    if (!userId || messages.length === 0) return;
    
    try {
      const lastMessage = messages[messages.length - 1].content;
      // Ensure messages are properly serialized for JSON storage
      const serializedMessages = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      await supabase.rpc('save_chat_conversation', {
        user_id_input: userId,
        messages_input: serializedMessages,
        last_message_input: lastMessage
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const generateResponse = (userMessage: string): string => {
    // Simple pattern matching for more contextual responses
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety') || lowerMsg.includes('worried')) {
      return "It sounds like you're feeling some anxiety. Remember that's a normal response, though it can be uncomfortable. What specifically is causing these feelings?";
    }
    
    if (lowerMsg.includes('sad') || lowerMsg.includes('depressed') || lowerMsg.includes('down')) {
      return "I hear that you're feeling down. It takes courage to acknowledge these feelings. Would you like to talk more about what might be contributing to this?";
    }

    if (lowerMsg.includes('happy') || lowerMsg.includes('good') || lowerMsg.includes('great')) {
      return "I'm glad to hear you're feeling positive! What's been contributing to these good feelings lately?";
    }
    
    if (lowerMsg.includes('tired') || lowerMsg.includes('exhausted') || lowerMsg.includes('sleep')) {
      return "Feeling tired can really affect our mental state. How has your sleep been lately? Are you able to get enough rest?";
    }
    
    if (lowerMsg.includes('angry') || lowerMsg.includes('frustrated') || lowerMsg.includes('mad')) {
      return "I can hear your frustration. Sometimes anger points us toward what matters to us. What boundaries or values feel like they might have been crossed?";
    }
    
    if (lowerMsg.includes('thank')) {
      return "You're very welcome. I'm here anytime you want to reflect or process your thoughts.";
    }
    
    if (lowerMsg.includes('help') || lowerMsg.includes('advice') || lowerMsg.includes('suggestion')) {
      return "I'd be happy to help you think through this. What specific aspect would you like to explore further?";
    }
    
    // If message is short, encourage more sharing
    if (userMessage.split(' ').length < 5) {
      return "I'd love to hear more about that. Could you tell me a bit more?";
    }
    
    // For longer messages, alternate between follow-up questions and supportive statements
    return messages.length % 2 === 0 
      ? followUpResponses[Math.floor(Math.random() * followUpResponses.length)]
      : supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toISOString()  // Store as ISO string for JSON serialization
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    // Wait a bit to simulate thinking
    setTimeout(() => {
      // Generate an appropriate response based on the content
      const responseContent = generateResponse(userMessage.content);
      
      // Add bot response
      const botResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: responseContent,
        timestamp: new Date().toISOString()  // Store as ISO string for JSON serialization
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsProcessing(false);
      // Save conversation after each exchange
      setTimeout(() => saveConversation(), 500);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b p-3 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="mr-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Your Companion</h1>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground max-w-[80%] rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-0"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-3">
        <div className="flex items-end space-x-2">
          <Textarea
            ref={textAreaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[150px] resize-none flex-1"
            rows={1}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={isProcessing || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanionChat;
