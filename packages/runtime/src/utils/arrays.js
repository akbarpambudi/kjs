
export function withoutNulls(arr) {
  if(!Array.isArray(arr)){
    return []
  }

  return arr.filter(item => item !== null && item !== undefined)
}