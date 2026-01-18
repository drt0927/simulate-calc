/**
 * Common Utility Functions
 */

// Format number with current locale (Korean)
function fmtNum(n) {
    if (!isFinite(n)) return '-';
    return Math.round(n).toLocaleString('ko-KR');
}
