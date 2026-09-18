import React from 'react';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

export default Layout;
