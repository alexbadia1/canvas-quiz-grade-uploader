interface GradebookQuestionGrade {
  /** Points awarded (i.e. 1, 2, 3, 4, 5) */
  points: string;
  /** Feedback provided to the student */
  comments: string;
}

/** 
 * Represents student submissions with their scores and comments
 * 
 * @example
 * 
 * const entries: GradebookQuestionEntries = {
 *   "67890": {
 *     points: "42",
 *     comments: "The answer to life, the universe, and everything"
 *   },
 *   "67891": {
 *     points: "42",
 *     comments: "Excellent work"
 *   }
 * }
 */
export interface GradebookQuestionGrades {
  [studentCanvasId: string]: GradebookQuestionGrade;
}

/**
 * Represents a Canvas question with all student submissions
 * 
 * @example
 * 
 * const question: GradebookQuestion = {
 *   canvasQuestionId: "12345",
 *   grades: {
 *     "420420": {
 *       points: 42,
 *       comments: "The answer to life, the universe, and everything"
 *     },
 *     "696969": {
 *       points: 69,
 *       comments: "The answer to life, the universe, and everything"
 *     }
 *   }
 * }
 */
export interface GradebookQuestion {
  /** HTML ID of the Canvas question */
  canvasQuestionId: string;
  /** Collection of student submissions */
  grades: GradebookQuestionGrades;
}

export interface HydratedGradebookQuestion extends GradebookQuestion {
  /** HTML ID of the Canvas question */
  storageKey: string;
}

/**
 * Represents a gradebook with student submissions
 * 
 * @example
 * 
 * const gradebookExample: GradebookByStudent = {
 *   "12345": { // studentCanvasId
 *     "5177502": { // canvasQuestionId
 *       score: 5,
 *       comments: "Good attempt, but needs improvement"
 *     },
 *     "5177506": {  // canvasQuestionId
 *       score: 10,
 *       comments: "Perfect!"
 *     },
 *     "5177507": {  // canvasQuestionId
 *       score: 8,
 *       comments: "Well done"
 *     },
 *   },
 * };
 */
export interface GradebookByStudent {
  [studentCanvasId: string]: {
    [canvasQuestionId: string]: GradebookQuestionGrade;
  };
}
