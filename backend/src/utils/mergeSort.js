function merge(left, right, compare) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (compare(left[i], right[j]) <= 0) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    while (i < left.length) {
        result.push(left[i]);
        i++;
    }

    while (j < right.length) {
        result.push(right[j]);
        j++;
    }

    return result;
}

export default function mergeSort(list, compare) {
    if (list.length <= 1) {
        return [...list];
    }

    const middle = Math.floor(list.length / 2);
    const left = mergeSort(list.slice(0, middle), compare);
    const right = mergeSort(list.slice(middle), compare);

    return merge(left, right, compare);
}
