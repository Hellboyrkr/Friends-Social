import React from 'react';

type Props = { children: React.ReactNode };

// Keep it dead simple (no Suspense fallback for now)
export const UIProvider: React.FC<Props> = ({ children }) => <>{children}</>;
