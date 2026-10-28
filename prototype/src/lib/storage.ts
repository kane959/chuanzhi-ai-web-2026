import type { Task } from '../types'

export const STORAGE_KEY = 'campusflow:progress:v2'

export function restoreProgress(initial: Task[]): Task[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!Array.isArray(stored)) return initial
    return initial.map((task) => {
      const saved = stored.find((item) => item && typeof item === 'object' && item.id === task.id)
      if (!saved) return task
      return {
        ...task, status: saved.status === 'done' ? 'done' as const : 'todo' as const,
        materials: task.materials.map((item) => ({ ...item,
          checked: typeof saved.materials?.[item.id] === 'boolean' ? saved.materials[item.id] : item.checked,
        })),
      }
    })
  } catch { return initial }
}

export function saveProgress(tasks: Task[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.map((task) => ({
      id: task.id, status: task.status,
      materials: Object.fromEntries(task.materials.map((item) => [item.id, item.checked])),
    }))))
    return true
  } catch { return false }
}
