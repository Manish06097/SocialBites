import React from 'react';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center font-headline ${className}`}>
      <span className="text-2xl font-bold tracking-tighter text-primary">
        Surat
      </span>
      <span className="text-2xl font-medium tracking-tight text-foreground">
        SocialBites
      </span>
    </div>
  );
};

export default Logo;
