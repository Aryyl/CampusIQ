import { getAll, put, STORES } from './storage'

export const activityService = {
  list: () => getAll(STORES.activities),
  add: (activity) => put(STORES.activities, activity),
}
