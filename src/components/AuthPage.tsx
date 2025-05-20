
import React from 'react';

const AuthPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md h-screen flex items-center justify-center">
      <div className="w-full p-6 bg-background rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <p className="text-center mb-6">Authentication options will be displayed here.</p>
      </div>
    </div>
  );
};

export default AuthPage;
