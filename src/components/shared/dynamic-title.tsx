'use client';
import { useEffect } from 'react';

const STORE_NAME_KEY = 'storeName';

export function DynamicTitle() {
    
    const updateTitle = () => {
        const savedStoreName = localStorage.getItem(STORE_NAME_KEY);
        if (savedStoreName) {
            document.title = savedStoreName;
        } else {
            document.title = "Kasiran";
        }
    };
    
    useEffect(() => {
        updateTitle();
        // Listen for the custom event
        window.addEventListener('settings_updated', updateTitle);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('settings_updated', updateTitle);
        };
    }, []);

    return null; // This component doesn't render anything visible
}
