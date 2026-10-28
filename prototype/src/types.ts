export type TaskStatus = 'todo' | 'done'
export type Availability = 'afternoon' | 'evening'
export type Material = { id: string; label: string; required: boolean; checked: boolean }
export type Task = {
  id: string; title: string; detail: string; location: string; status: TaskStatus
  kind: 'onsite' | 'online'; duration: number
  materials: Material[]; evidence: string[]; note: string
}
export type Evidence = {
  id: string; title: string; domain: string; source: string; locator: string; updated: string
  text: string; paragraphs: string[]; keywords: string[]; taskIds: string[]
}
export type RetrievalHit = { evidence: Evidence; score: number; matchedTerms: string[] }
export type ScheduledTask = { task: Task; day: string; time: string; conflict: boolean; reason: string }
export type TraceEvent = { id: string; label: string; detail: string; state: 'done' | 'warning' }
