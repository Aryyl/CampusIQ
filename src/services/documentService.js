import { getAll, getById, put, remove, STORES } from './storage'

export const documentService = {
  list: () => getAll(STORES.documents),
  get: (id) => getById(STORES.documents, id),
  save: (document) => put(STORES.documents, document),
  delete: async (id) => {
    await remove(STORES.documents, id)
    await remove(STORES.documentFiles, id)
  },
  saveFile: (id, file) => put(STORES.documentFiles, { id, file }),
  getFile: async (id) => {
    const record = await getById(STORES.documentFiles, id)
    return record?.file || null
  },
}
