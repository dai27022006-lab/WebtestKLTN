'use client';

import { CartProvider, ExperimentProvider } from '@/state';

import { AuthProvider } from './AuthProvider';
import { LocaleProvider } from './LocaleProvider';
import { PageViewTracker } from './PageViewTracker';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <ExperimentProvider>
            <CartProvider>
              <PageViewTracker />
              {children}
            </CartProvider>
          </ExperimentProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
