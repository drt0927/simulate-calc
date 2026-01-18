// 청년도약계좌 계산기 로직

// 정부 기여금 매칭 기준표 (2025/2026 기준, 서민금융진흥원)
// personalIncomeLimit: 개인소득(총급여) 상한 (단위: 만원)
// matchLimit: 기여금 지급 한도 (월 납입금 중 이 금액까지만 매칭) (단위: 원)
// matchRatio: 매칭 비율 (0.06 = 6.0%)
// maxMonthlyContrib: 월 최대 기여금 (단위: 원) - 참고용 (계산됨)
const CONTRIBUTION_TABLE = [
    { limit: 2400, matchLimit: 400000, ratio: 0.06 },  // ~2400만원: 40만원까지 6%
    { limit: 3600, matchLimit: 500000, ratio: 0.046 }, // ~3600만원: 50만원까지 4.6%
    { limit: 4800, matchLimit: 600000, ratio: 0.037 }, // ~4800만원: 60만원까지 3.7%
    { limit: 6000, matchLimit: 700000, ratio: 0.03 },  // ~6000만원: 70만원까지 3.0%
    { limit: 7500, matchLimit: 0, ratio: 0 }      // ~7500만원: 기여금 없음 (비과세만)
];

// 7500만원 초과 시: 지원 없음 (가입 불가 또는 일반 과세)
const INCOME_CAP = 7500;

function getContributionInfo(incomeWan) {
    if (incomeWan > INCOME_CAP) {
        return { eligible: false, matchLimit: 0, ratio: 0, taxFree: false, note: "가입 대상 아님 (소득 초과)" };
    }

    // 비과세는 7500이하 모두 적용
    const taxFree = true;

    // 기여금 매칭 구간 찾기
    const matchRule = CONTRIBUTION_TABLE.find(rule => incomeWan <= rule.limit);

    if (!matchRule) {
        // 이론상 여기 올 일은 없음 (INCOME_CAP 체크 했으므로)
        return { eligible: true, matchLimit: 0, ratio: 0, taxFree, note: "기여금 없음" };
    }

    return {
        eligible: true,
        matchLimit: matchRule.matchLimit,
        ratio: matchRule.ratio,
        taxFree,
        note: `소득 ${matchRule.limit}만원 이하 구간`
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const elIncome = document.getElementById('income');
    const elMonthly = document.getElementById('monthlyPay');
    const elRate = document.getElementById('rate');
    const elCalcBtn = document.getElementById('calcBtn');

    const elResPrincipal = document.getElementById('resPrincipal');
    const elResGov = document.getElementById('resGov');
    const elResInterest = document.getElementById('resInterest');
    const elResTotal = document.getElementById('resTotal');
    const elResReturnRate = document.getElementById('resReturnRate');
    const elResTaxInfo = document.getElementById('resTaxInfo');

    const resultBox = document.getElementById('resultBox');

    // 숫자 포맷팅 (common.js fmtNum 사용 권장하지만 여기서는 간단히 구현)
    const fmt = (n) => Math.round(n).toLocaleString('ko-KR');

    function calculate() {
        const incomeWan = parseFloat(elIncome.value) || 0; // 단위: 만원
        const monthlyPay = parseFloat(elMonthly.value) || 0; // 단위: 원
        const ratePercent = parseFloat(elRate.value) || 0; // 단위: %

        if (monthlyPay <= 0) {
            alert("월 납입금액을 입력해주세요.");
            return;
        }

        // 1. 정부 기여금 계산
        const rule = getContributionInfo(incomeWan);

        let totalPrincipal = monthlyPay * 60; // 5년(60개월)
        let totalGov = 0;
        let totalInterest = 0;

        // 기여금 산정 (월마다 적립)
        if (rule.eligible && rule.ratio > 0) {
            // 매칭 한도 적용
            const matchBase = Math.min(monthlyPay, rule.matchLimit);
            const monthlyGov = Math.floor(matchBase * rule.ratio); // 원 단위 절사 가정
            totalGov = monthlyGov * 60;
        }

        // 2. 은행 이자 계산 (단리 가정, 적금 이자 공식)
        // 총 이자 = 월납입액 * n(n+1)/2 * (r/12)
        // n = 60
        const n = 60;
        const r = ratePercent / 100;
        // 단리 적금 공식
        const interestRaw = monthlyPay * (n * (n + 1) / 2) * (r / 12);

        // 비과세 적용 여부
        let finalInterest = interestRaw;
        let taxText = "(비과세)";

        if (!rule.eligible) {
            // 가입 불가 수준이면 일반 과세(15.4%) 적용 (시뮬레이션 용)
            finalInterest = interestRaw * (1.0 - 0.154);
            taxText = "(일반과세 15.4%)";
        } else if (!rule.taxFree) {
            // 혹시라도 룰이 바뀌어서 비과세가 아닌 경우가 생긴다면
            finalInterest = interestRaw * (1.0 - 0.154);
            taxText = "(과세)";
        }

        totalInterest = Math.floor(finalInterest);

        // 3. 최종 합계
        const grandTotal = totalPrincipal + totalGov + totalInterest;
        const returnRate = ((grandTotal - totalPrincipal) / totalPrincipal) * 100;

        // UI Update
        elResPrincipal.textContent = fmt(totalPrincipal);
        elResGov.textContent = fmt(totalGov);
        elResInterest.textContent = fmt(totalInterest);
        elResTotal.textContent = fmt(grandTotal);
        elResReturnRate.textContent = returnRate.toFixed(2);
        elResTaxInfo.textContent = rule.eligible ? "비과세 적용" : "과세(가입대상 아님)";

        // Show result
        resultBox.classList.remove('d-none');
    }

    elCalcBtn.addEventListener('click', calculate);
});
