export function formatRequestItems(request: any) {
  if (request.items && request.items.length > 0) {
    return request.items.map((i: any) => i.description).join(', ')
  }
  return request.description || 'Sem descrição'
}
