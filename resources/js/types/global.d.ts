import type { Auth } from '@/types/auth';
import type { LaravelEcho } from 'laravel-echo';
import type Pusher from 'pusher-js';

declare global {
    interface Window {
        // Now you get full IDE support for Echo methods
        Echo: LaravelEcho; 
        Pusher: typeof Pusher;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}

export {};