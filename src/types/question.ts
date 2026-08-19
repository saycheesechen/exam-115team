export type QuestionType = 'single' | 'multiple'

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  category: string
  number: number
  type: QuestionType
  question: string
  options: QuestionOption[]
  answers: string[]
  explanation: string
  source: string
}

export interface QuestionBank {
  generatedAt: string
  questionCount: number
  categories: Array<{ id: string; name: string; count: number; singleCount: number; multipleCount: number }>
  questions?: Question[]
}
