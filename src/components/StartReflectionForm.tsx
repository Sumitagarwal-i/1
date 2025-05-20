
import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";

export const StartReflectionForm: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Start a New Reflection</CardTitle>
        <CardDescription>
          Take a moment to reflect on your thoughts and feelings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea 
          placeholder="How are you feeling today?" 
          className="min-h-[120px]" 
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>Begin Reflection</Button>
      </CardFooter>
    </Card>
  );
};

export default StartReflectionForm;
