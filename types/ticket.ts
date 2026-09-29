export type Priority = 'низький' | 'середній' | 'високий'
export type Category = 'оплата' | 'доставка' | 'скарга' | 'інше'

export interface Ticket {
  id: string
  clientName: string
  text: string
  priority: Priority | null
  category: Category | null
  summary: string | null
  draftResponse: string | null
  createdAt: string
}

export interface AnalysisResult {
  priority: Priority
  category: Category
  summary: string
  draftResponse: string
}
