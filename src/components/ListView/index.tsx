import { useEffect, useState } from 'react';
import { useGradebook } from '../../contexts/GradebookContext';
import { HydratedGradebookQuestion } from '../../lib/model';

import './index.css';

interface ListTileProps {
    question: HydratedGradebookQuestion;
}

export function ListTile({ question }: ListTileProps) {
    const { gradebook } = useGradebook();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const formattedJson = JSON.stringify(question, null, 2);

    const handleDelete = (storageKey: string) => {
        gradebook.deleteQuestion(storageKey);
    };

    const handleView = (storageKey: string) => {
        setIsModalOpen(true);
    };

    return (
        <>
            <li className="list-tile">
                <div className="list-tile-content">
                    <span className="filename">{question.storageKey}</span>
                    <span className="question-id">Canvas Question ID: {question.canvasQuestionId}</span>
                </div>
                <div className="list-tile-actions">
                    <button className="icon-button" aria-label="View" onClick={() => handleView(question.storageKey)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                    <button className="icon-button" aria-label="Delete" onClick={() => handleDelete(question.storageKey)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                    </button>
                </div>
            </li>
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{question.storageKey}</h3>
                            <button
                                className="icon-button close-button"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕
                            </button>
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
        </>
    );
}

export function ListView() {
    const { gradebook } = useGradebook();
    const [questions, setQuestions] = useState<HydratedGradebookQuestion[]>(() =>
        gradebook.getAllQuestions()
    );

    useEffect(() => {
        const handleStorageChange = () => {
            setQuestions(gradebook.getAllQuestions());
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('gradebook-event', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('gradebook-event', handleStorageChange);
        };
    }, [gradebook]);

    return <ul id="list-view">
        {questions.map((gq: HydratedGradebookQuestion) => (
            <ListTile key={gq.storageKey} question={gq} />
        ))}
    </ul>;
}