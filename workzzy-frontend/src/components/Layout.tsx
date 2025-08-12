import React from 'react';
import NavigationHeader from './layout/NavigationHeader';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <NavigationHeader />
      {children}
    </div>
  );
};

export default Layout;