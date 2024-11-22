import React, { useRef } from 'react';
import { Submission } from '../../components/Submission';
import hydrate_grades from '../../hydrated-grades.json';
import { ISubmission } from '../../lib/model';

import './index.css';

export function App() {
  const isProcessingRef = useRef(false);

  const handleAutograde = async (_: any) => {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    if (tab?.id !== undefined) {
      try {
        await Promise.race([
          chrome.tabs.sendMessage(tab.id, {
            action: 'grade_students',
            payload: hydrate_grades,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]);
      } catch (error) {
        console.error(error);
      }
    }
    isProcessingRef.current = false;
  };

  return (
    <div className="app w-full h-screen" data-theme="black">
      <button onClick={handleAutograde} style={{ padding: 32 }}>
        AUTOGRADE
      </button>
      <ul>
        {Object.keys(hydrate_grades).map((full_name: string) => {
          const submission = (hydrate_grades as any)[full_name] as ISubmission;
          return (
            <Submission
              key={submission.canvas_id}
              submission_data={submission}
            />
          );
        })}
      </ul>
    </div>
  );
}
