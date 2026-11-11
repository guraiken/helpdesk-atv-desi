export function truncateToMinute(date) {
    const copy = new Date(date);
    copy.setSeconds(0, 0);
    return copy;
}
