'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#252525',
            borderRadius: '16px',
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: '800',
          },
          success: {
            style: {
              background: '#FFFFFF',
              color: '#065F46',
              border: '1.5px solid #10B981',
              boxShadow: '0 16px 40px rgba(16, 185, 129, 0.15)',
            },
            iconTheme: {
              primary: '#10B981', // Pure Green
              secondary: '#FFFFFF',
            },
          },
          error: {
            style: {
              background: '#FFFFFF',
              color: '#991B1B',
              border: '1.5px solid #EF4444',
              boxShadow: '0 16px 40px rgba(239, 68, 68, 0.15)',
            },
            iconTheme: {
              primary: '#EF4444', // Pure Red
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
