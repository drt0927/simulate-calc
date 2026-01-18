document.addEventListener('DOMContentLoaded', () => {
    const periodHomeSelect = document.getElementById('periodHome');
    const periodAccountSelect = document.getElementById('periodAccount');
    const dependentsInput = document.getElementById('dependents');
    const btnMinus = document.getElementById('btnMinusDep');
    const btnPlus = document.getElementById('btnPlusDep');

    const scorePeriodDisplay = document.getElementById('scorePeriodDisplay');
    const scoreDependentsDisplay = document.getElementById('scoreDependentsDisplay');
    const scoreAccountDisplay = document.getElementById('scoreAccountDisplay');
    const dependentsText = document.getElementById('dependentsText');
    const totalScoreDisplay = document.getElementById('totalScore');

    // --- Logic Functions ---

    function getHomePeriodScore(yearsStr) {
        const years = parseFloat(yearsStr); // Value from option (0 to 15)
        // 1년 미만(0): 2점
        // 1년 이상(1) ~ 15년 이상(15) -> 2 + (years * 2)
        // Check rule:
        // 0 (less than 1 yr) -> 2
        // 1 (1 yr - 2 yr) -> 4
        // ...
        // 15 (15yr +) -> 32

        let score = 0;
        if (years === 0) {
            score = 2; // 1년 미만
        } else {
            score = 2 + (years * 2);
        }

        // Cap at 32
        if (score > 32) score = 32;
        return score;
    }

    function getDependentsScore(count) {
        // 0명: 5점
        // 1명당 5점 추가
        // Max 35 (6명 이상)
        let score = 5 + (count * 5);
        if (score > 35) score = 35;
        return score;
    }

    function getAccountPeriodScore(yearsStr) {
        const years = parseFloat(yearsStr);
        // 6개월 미만(0): 1점
        // 6개월~1년(0.5): 2점
        // 1년~2년(1): 3점
        // ... +1 per year
        // 15년 이상(15): 17점

        if (years === 0) return 1;
        if (years === 0.5) return 2;

        // From 1 year (1) -> 3 points
        // years + 2
        // e.g. 1 -> 3
        // e.g. 15 -> 17
        let score = years + 2;
        if (score > 17) score = 17;
        return score;
    }

    function calculate() {
        // 1. Home Period
        const homeYears = periodHomeSelect.value;
        const homeScore = getHomePeriodScore(homeYears);
        scorePeriodDisplay.textContent = `${homeScore}점`;

        // 2. Dependents
        let depCount = parseInt(dependentsInput.value) || 0;
        // Clamp
        if (depCount < 0) depCount = 0;
        if (depCount > 6) depCount = 6; // UI limits, but logic allows 6+ to be same score. 
        // Logic limit is score 35 (which is 6 people). 

        const depScore = getDependentsScore(depCount);
        scoreDependentsDisplay.textContent = `${depScore}점`;
        dependentsText.textContent = `본인을 제외한 가족 수: ${depCount}명 (${depScore}점)`;

        // 3. Account Period
        const accountYears = periodAccountSelect.value;
        const accountScore = getAccountPeriodScore(accountYears);
        scoreAccountDisplay.textContent = `${accountScore}점`;

        // Total
        const total = homeScore + depScore + accountScore;
        totalScoreDisplay.innerHTML = `${total}<span class="fs-4 fw-normal text-muted ms-1">점</span>`;

        // Animation effect (simple)
        totalScoreDisplay.classList.remove('text-dark');
        totalScoreDisplay.classList.add('text-primary');
        setTimeout(() => {
            totalScoreDisplay.classList.remove('text-primary');
            totalScoreDisplay.classList.add('text-dark');
        }, 300);
    }

    // --- Event Listeners ---

    periodHomeSelect.addEventListener('change', calculate);
    periodAccountSelect.addEventListener('change', calculate);

    // Dependents Inputs
    btnMinus.addEventListener('click', () => {
        let v = parseInt(dependentsInput.value) || 0;
        if (v > 0) {
            dependentsInput.value = v - 1;
            calculate();
        }
    });

    btnPlus.addEventListener('click', () => {
        let v = parseInt(dependentsInput.value) || 0;
        if (v < 6) { // Max 6 for simplicity in UI, though logic supports more, max score is reachable at 6
            dependentsInput.value = v + 1;
            calculate();
        }
    });

    // Also support direct input change
    dependentsInput.addEventListener('change', () => {
        let v = parseInt(dependentsInput.value) || 0;
        if (v < 0) v = 0;
        if (v > 6) v = 6;
        dependentsInput.value = v;
        calculate();
    });


    // Initial Calc
    calculate();
});
