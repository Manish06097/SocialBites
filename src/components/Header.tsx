'use client';

import Link from 'next/link';
import Logo from './Logo';

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm md:block hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>
    </header>
  );
};

export default Header;
