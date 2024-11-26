import { useState } from 'react';
import { useGradebook } from '../../contexts/GradebookContext';
import { useAutoUpload } from '../../hooks/useAutoUpload';
import { Upload } from '../../components/Upload';
import { ListView } from '../../components/ListView';

import './index.css';

export function App() {
  const { gradebook } = useGradebook();
  const { autoUpload } = useAutoUpload();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formattedJson, setFormattedJson] = useState('');

  const handleAutoUpload = () => {
    if (gradebook) {
      setIsModalOpen(true);
      const gradebookQuestions = gradebook.getAllQuestions();
      const mergedGradebookByStudent = gradebook.mergeGradebookQuestionsByStudent(gradebookQuestions);
      setFormattedJson(JSON.stringify(mergedGradebookByStudent, null, 2));
      autoUpload(mergedGradebookByStudent);
    }
  };

  return (
    <div className="app">
      <div id="header">
        <h1 id="title">Gradebook Uploader</h1>
        <button id="auto-upload-button" onClick={handleAutoUpload}>AUTO UPLOAD</button>
        <p id="subtitle">Each question should be in its own json file.</p>
      </div>
      <Upload />
      <ListView />
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Running Upload...</h3>
              <button
                className="icon-button close-button"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
              {/* <p>This may take a while... don't touch anything, unless you understand how chrome plugins work.</p>
              <p>To abort, spam refresh the page</p>
              <p>
                Some status logs would be nice... but the chrome plugin and web browser are isolated processess which
                would require a messaging protocol and the syncronization of states between two processes. It's doable,
                but overkill for this project.
              </p> */}
            </div>
            <textarea
              className="json-preview"
              readOnly
              value={formattedJson}
              wrap="off"
            />
          </div>
        </div>
      )}
    </div>
  );
}
