import React, { useRef } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useGradebook } from '../../contexts/GradebookContext';

import './index.css';

export function Upload() {
    const { gradebook } = useGradebook();
    const { handleFileUpload } = useFileUpload({
        onSuccess: ({ filename, content }) => {
            gradebook.setQuestion(filename, content);
        },
        onError: (error) => console.error('Error:', error)
    });

    return (
        <>
            <div className="custom-file-input">
                <input id="file-input" type="file" accept=".json" onChange={handleFileUpload} />
                <label id="file-input-label" htmlFor="file-input">Choose a json file or drag it here</label>
            </div>
        </>
    );
}
