import { DynamicWidget, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

export default function Header() {
  const isLoggedIn = useIsLoggedIn();
  return (
    <header className='w-full h-[60px] border-b flex justify-end items-center px-4'>
      {isLoggedIn && <DynamicWidget />}
    </header>
  );
}
