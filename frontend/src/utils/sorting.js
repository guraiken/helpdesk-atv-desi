function merge(left, right, compareFn) {
  const result = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compareFn(left[leftIndex], right[rightIndex]) <= 0) {
      result.push(left[leftIndex])
      leftIndex++
    } else {
      result.push(right[rightIndex])
      rightIndex++
    }
  }

  return result
    .concat(left.slice(leftIndex))
    .concat(right.slice(rightIndex))
}

export function mergeSort(array, compareFn) {
  if (!Array.isArray(array) || array.length <= 1) {
    return array ? [...array] : []
  }

  const middle = Math.floor(array.length / 2)
  const left = array.slice(0, middle)
  const right = array.slice(middle)

  return merge(
    mergeSort(left, compareFn),
    mergeSort(right, compareFn),
    compareFn
  )
}

export function compareTicketsByOpeningDate(a, b) {
  const timeA = new Date(a.openedAt).getTime()
  const timeB = new Date(b.openedAt).getTime()

  if (timeA !== timeB) {
    return timeA - timeB
  }
  return (a.id || 0) - (b.id || 0)
}

export function sortTicketsOldestFirst(tickets) {
  return mergeSort(tickets, compareTicketsByOpeningDate)
}
