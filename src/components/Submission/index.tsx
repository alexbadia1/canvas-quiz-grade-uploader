import React, { useRef } from 'react';
import { ISubmission } from '../../lib/model';

import './index.css';

interface SubmissionProps {
  submission_data: ISubmission;
}

export function Submission({ submission_data }: SubmissionProps) {
  const isProcessingRef = useRef(false);

  const handleClick = async (_: any) => {
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
            action: 'grade_student',
            payload: submission_data,
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
    <div className="email rounded-sm" onClick={handleClick}>
      {`${submission_data.full_name} --- ${submission_data.grade} point(s)`}
    </div>
  );
}
