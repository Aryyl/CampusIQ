import { getAll, put, remove, STORES } from './storage'

export const deadlineService = {
  list: () => getAll(STORES.deadlines),
  save: (deadline) => put(STORES.deadlines, deadline),
  delete: (id) => remove(STORES.deadlines, id),
}
