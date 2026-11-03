import { getAll, STORES } from './storage'

export const analyticsService = {
  list: () => getAll(STORES.analytics),
}
