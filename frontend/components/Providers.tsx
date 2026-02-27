'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import { ToastProvider } from './ui/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
    // Wrap Redux Provider with ToastProvider
    return (
        <Provider store={store}>
            <ToastProvider>
                {children}
            </ToastProvider>
        </Provider>
    );
}
