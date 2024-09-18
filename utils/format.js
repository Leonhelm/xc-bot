export const formatIds = (ids) => {
  if (typeof ids !== 'string') {
    return [];
  }
  return ids.split(',').map(id => id.trim()).filter(Boolean);
}
