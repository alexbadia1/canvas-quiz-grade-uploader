import { GradebookByStudent, GradebookQuestion, HydratedGradebookQuestion } from "./model";

type StorageType = 'local' | 'session';

export interface GradebookConfig {
    storageType: StorageType;
    prefix: string;
}

export class Gradebook {
    private storage: Storage;
    private prefix: string;

    constructor(config: GradebookConfig) {

        const { storageType = 'session', prefix = 'gradebook' } = config;

        this.storage = storageType === 'local'
            ? window.localStorage
            : window.sessionStorage;
        this.prefix = prefix;
    }

    private getKey(key: string) {
        return `${this.prefix}/${key}`;
    }

    public getPrefix(): string {
        return this.prefix;
    }

    public setQuestion(key: string, value: GradebookQuestion): void {
        try {
            this.validateGradebookQuestion(value);
            this.storage.setItem(this.getKey(key), JSON.stringify(value));
            window.dispatchEvent(new Event('gradebook-event'));
        } catch (error) {
            console.error('Error setting storage item:', error);
        }
    }

    public deleteQuestion(storageKey: string): void {
        this.storage.removeItem(storageKey);
        window.dispatchEvent(new Event('gradebook-event'));
    }

    private getQuestion(storageKey: string): GradebookQuestion | null {
        try {
            const item = this.storage.getItem(storageKey);
            const gradebookQuestion = item ? JSON.parse(item) : null;

            if (!this.validateGradebookQuestion(gradebookQuestion)) {
                throw new Error('The stored GradebookQuestion is no longer valid!');
            }

            return gradebookQuestion;
        } catch (error) {
            console.error('Error getting storage item:', error);
            return null;
        }
    }

    public getAllQuestions(): HydratedGradebookQuestion[] {
        const keys = Object.keys(this.storage);
        const questions = keys.map((k) => {
            const q = this.getQuestion(k);
            if (q === null) {
                return null;
            }
            return {
                storageKey: k,
                ...q
            };
        }).filter((q) => q !== null) as HydratedGradebookQuestion[];
        return questions;
    }

    public toJson(): string {
        return JSON.stringify(this.getAllQuestions());
    }

    private validateGradebookQuestion(gradebookQuestion: object): boolean {

        if (typeof gradebookQuestion !== 'object') {
            throw new Error('GradebookQuestion must be an object!');
        }

        if (gradebookQuestion === null) {
            throw new Error('GradebookQuestion cannot be null!');
        }

        return this.validateCanvasQuestionId(gradebookQuestion) && this.validateGrades(gradebookQuestion);
    }

    private validateCanvasQuestionId(gradebookQuestion: object): boolean {
        if (!('canvasQuestionId' in gradebookQuestion)) {
            throw new Error(`GradebookQuestion.canvasQuestionId cannot be undefined!`);
        }

        if (gradebookQuestion.canvasQuestionId === null) {
            throw new Error(`GradebookQuestion.canvasQuestionId cannot be null!`);
        }

        if (typeof gradebookQuestion.canvasQuestionId !== 'string') {
            throw new Error(`GradebookQuestion.canvasQuestionId must be a string!`);
        }

        return true;
    }

    private validateGrades(gradebookQuestion: object): boolean {
        const grades = (gradebookQuestion as GradebookQuestion)?.grades;

        if (typeof grades !== 'object') {
            throw new Error('GradebookQuestion.grades must be an object!');
        }

        if (grades === null) {
            throw new Error('GradebookQuestion.grades cannot be null!');
        }

        for (const studentCanvasId of Object.keys(grades)) {
            this.validateStudentCanvasId(studentCanvasId);
            this.validateGradebookQuestionGrade(studentCanvasId, grades[studentCanvasId]);
        }

        return true;
    }

    private validateStudentCanvasId(studentCanvasId: string): boolean {
        if (typeof studentCanvasId !== 'string') {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId} must be a string!`);
        }
        if (studentCanvasId === '') {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId} cannot be an empty string!`);
        }
        return true;
    }

    private validateGradebookQuestionGrade(studentCanvasId: string, grade: object): boolean {
        if (typeof grade !== 'object') {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId} must be an object\{points: string; comments: string;\}`);
        }
        if (grade === null) {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId} cannot be null!`);
        }
        if (!('points' in grade)) {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId} must have a points field!`);
        }
        if (typeof grade.points !== 'string') {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId}.points must be a string!`);
        }
        if (!('comments' in grade)) {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId} must have a comments field!`);
        }
        if (typeof grade.comments !== 'string') {
            throw new Error(`GradebookQuestion.grades.${studentCanvasId}.comments must be a string!`);
        }
        return true;
    }

    /**
     * Merges multiple GradebookQuestion objects into a single GradebookByStudent structure
     * 
     * @param questions - Array of GradebookQuestion objects to merge
     * @returns GradebookByStudent object organized by student ID
     * 
     * @example
     * const questions: GradebookQuestion[] = [
     *   {
     *     canvasQuestionId: "q1",
     *     grades: {
     *       "student1": { points: "5", comments: "Good" },
     *       "student2": { points: "4", comments: "Ok" }
     *     }
     *   },
     *   {
     *     canvasQuestionId: "q2",
     *     grades: {
     *       "student1": { points: "3", comments: "Fair" }
     *     }
     *   }
     * ];
     * 
     * const result = mergeGradebookQuestions(questions);
     * // Result:
     * // {
     * //   "student1": {
     * //     "q1": { points: "5", comments: "Good" },
     * //     "q2": { points: "3", comments: "Fair" }
     * //   },
     * //   "student2": {
     * //     "q1": { points: "4", comments: "Ok" }
     * //   }
     * // }
     */
    public mergeGradebookQuestionsByStudent(questions: GradebookQuestion[]): GradebookByStudent {
        return questions.reduce((result: GradebookByStudent, q: GradebookQuestion) => {
            Object.entries(q.grades).forEach(([studentId, grade]) => {
                if (!(studentId in result)) {
                    result[studentId] = {};
                }
                result[studentId][q.canvasQuestionId] = grade;
            });
            return result;
        }, {} as GradebookByStudent);
    }
}