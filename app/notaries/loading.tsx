// app/my-feature/MyComponent.tsx
'use client'; // Required if using hooks or browser-only APIs

import React from 'react';

const MyComponent = ({ name }: { name: string }) => {
  return <div className="text-lg font-bold">Hello, {name}!</div>;
};

export default MyComponent;
