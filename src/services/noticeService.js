import { getAll, put, remove, STORES } from './storage'

export const noticeService = {
  list: () => getAll(STORES.notices),
  save: (notice) => put(STORES.notices, notice),
  delete: (id) => remove(STORES.notices, id),
}
