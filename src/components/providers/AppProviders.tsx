'use client';

import { CartProvider, ExperimentProvider } from '@/state';

import { AuthProvider } from './AuthProvider';
import { PageViewTracker } from './PageViewTracker';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExperimentProvider>
          <CartProvider>
            <PageViewTracker />
            {children}
          </CartProvider>
        </ExperimentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
