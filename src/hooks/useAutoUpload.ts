import { useRef } from 'react';
import { Gradebook } from '../lib/gradebook';
import { GradebookByStudent } from '../lib/model';

const AUTOGRADE_TIMEOUT_MS = 300_000; // 5 minutes

const createTimeoutPromise = (ms: number) => new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
);

export function useAutoUpload() {
    const isProcessingRef = useRef(false);

    const autoUpload = async (gradebook: GradebookByStudent) => {
        if (isProcessingRef.current) {
            return;
        }

        isProcessingRef.current = true;

        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });

            if (tab?.id !== undefined) {
                await Promise.race([
                    chrome.tabs.sendMessage(tab.id, { action: 'auto-upload', payload: gradebook }),
                    createTimeoutPromise(AUTOGRADE_TIMEOUT_MS),
                ]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingRef.current = false;
        }
    };

    return { autoUpload };
}