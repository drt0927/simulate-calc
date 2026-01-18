// 실업급여(구직급여) 계산기 로직
// 기준: 2019.10.1 이후 이직, 2025년 상/하한액 기준

// 1. 소정급여일수 (수급 기간) 테이블
// 행: 가입기간 구간 (1년미만, 1~3, 3~5, 5~10, 10년이상)
// 열: 나이 구간 (50세 미만, 50세 이상 및 장애인)
const DURATION_TABLE = [
    // [50세 미만, 50세 이상/장애인]
    [120, 120], // 1년 미만
    [150, 180], // 1년 이상 ~ 3년 미만
    [180, 210], // 3년 이상 ~ 5년 미만
    [210, 240], // 5년 이상 ~ 10년 미만
    [240, 270]  // 10년 이상
];

// 가입기간 인덱스 찾기 함수
function getPeriodIndex(years) {
    if (years < 1) return 0;
    if (years < 3) return 1;
    if (years < 5) return 2;
    if (years < 10) return 3;
    return 4; // 10년 이상
}

// 2. 금액 기준 (2025년 기준)
// 상한액: 66,000원
// 하한액: 63,104원 (소정근로 8시간 기준)
// * 하한액은 최저임금의 80% 등으로 계산되나, 모의계산용으로 고정값 사용 (매년 변동)
const LIMITS = {
    upper: 66000,
    lower: 63104
};

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const elAge = document.getElementById('age');
    const elDisabled = document.getElementById('isDisabled');
    const elPeriodYear = document.getElementById('periodYear');
    const elPeriodMonth = document.getElementById('periodMonth');
    const elAvgWage = document.getElementById('avgWage'); // 3개월 월 평균 급여
    const elCalcBtn = document.getElementById('calcBtn');

    // Outputs
    const elResDaily = document.getElementById('resDaily');
    const elResDays = document.getElementById('resDays');
    const elResTotal = document.getElementById('resTotal');
    const elResultBox = document.getElementById('resultBox');
    const elNote = document.getElementById('note');

    // Utils
    const fmt = (n) => Math.round(n).toLocaleString('ko-KR');

    function calculate() {
        // Inputs
        const age = parseInt(elAge.value) || 0;
        const isDisabled = elDisabled.checked;
        const pYear = parseInt(elPeriodYear.value) || 0;
        const pMonth = parseInt(elPeriodMonth.value) || 0;
        const avgMonthlyWage = parseInt(elAvgWage.value) || 0; // 원 단위 입력 가정 (또는 만원?) -> 기획서엔 '만원'이라 되어있으나, placeholder엔 금액 입력 유도.
        // 기획서: "최근 3개월 월 급여 ... Number (만원)" -> 근데 보통 급여는 원단위가 정확함.
        // 여기서는 '원 단위' 입력을 받도록 UI구성 (placeholder: 예: 3000000)

        // Validation
        if (avgMonthlyWage <= 0) {
            alert("월 평균 급여를 입력해주세요.");
            return;
        }

        // 1. 소정급여일수 계산
        // 가입기간 환산 (년)
        const totalYears = pYear + (pMonth / 12);
        const periodIdx = getPeriodIndex(totalYears);

        // 나이 기준 (50세 이상 or 장애인)
        const isPriority = (age >= 50) || isDisabled;
        const durationCols = DURATION_TABLE[periodIdx];
        const duration = isPriority ? durationCols[1] : durationCols[0];

        // 2. 구직급여일액 계산
        // 평균일급 = 월급여 / 30 (약식)
        // 기초일액 = 평균일급 * 60%
        let dailyWage = (avgMonthlyWage / 30) * 0.6;

        // 상/하한 적용
        let appliedLimit = "";
        if (dailyWage > LIMITS.upper) {
            dailyWage = LIMITS.upper;
            appliedLimit = "상한액 적용";
        } else if (dailyWage < LIMITS.lower) {
            dailyWage = LIMITS.lower;
            appliedLimit = "하한액 적용";
        }

        const finalDaily = Math.floor(dailyWage); // 원단위 절사
        const totalBenefit = finalDaily * duration;

        // Output Update
        elResDaily.textContent = fmt(finalDaily);
        elResDays.textContent = `${duration}일`;
        elResTotal.textContent = fmt(totalBenefit);

        if (appliedLimit) {
            elNote.textContent = `* ${appliedLimit} (${fmt(finalDaily)}원/일)`;
            elNote.style.display = 'block';
        } else {
            elNote.style.display = 'none';
        }

        elResultBox.classList.remove('d-none');
    }

    elCalcBtn.addEventListener('click', calculate);
});
