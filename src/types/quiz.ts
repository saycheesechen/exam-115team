import type { Question, QuestionType } from './question'

export type QuizMode = 'practice' | 'exam'

export interface QuizConfig {
  categoryIds: string[]
  questionTypes: QuestionType[]
  questionCount: number
  mode: QuizMode
  timeLimitMinutes: number | null
  shuffleQuestions: boolean
  shuffleOptions: boolean
}

export interface QuizResult {
  id: string
  completedAt: string
  categoryIds: string[]
  total: number
  correct: number
  percentage: number
  durationSeconds: number
}

export interface AnswerReview {
  question: Question
  selected: string[]
  correct: boolean
}
