import { createContext, useContext, useMemo } from 'react';
import { Gradebook, GradebookConfig } from '../lib/gradebook';

const GradebookContext = createContext<{ gradebook: Gradebook } | null>(null);

export function GradebookProvider({ children, config }: { children: React.ReactNode; config: GradebookConfig }) {
    const gradebook = useMemo(() => new Gradebook(config), []);
    
    return (
        <GradebookContext.Provider value={{ gradebook }}>
            {children}
        </GradebookContext.Provider>
    );
}

export function useGradebook() {
    const context = useContext(GradebookContext);
    if (!context) {
        throw new Error('useGradebook must be used within a GradebookProvider');
    }
    return context;
}