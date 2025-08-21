import React from 'react';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src="/logo.png" alt="SocialBites Logo" className="h-24 w-auto" />
    </div>
  );
};

export default Logo;
