// Childcare Calculator Logic Reference
// Extracted from original index.html provided by user.

// -- DOM Helper --
const $ = (id) => document.getElementById(id);

// -- Utilities --
function toNumber(raw) {
    if (raw === null || raw === undefined) return NaN;
    const s = String(raw).replace(/[, ]/g, '').trim();
    if (s === '') return NaN;
    return Number(s);
}

function fmtWon(n) {
    if (!isFinite(n)) return '-';
    return Math.round(n).toLocaleString('ko-KR') + '원';
}

function setMsg(type, html) {
    const el = $('msg');
    if (!el) return;
    if (!html) { el.innerHTML = ''; return; }
    const cls = type === 'err' ? 'alert alert-danger' : (type === 'warn' ? 'alert alert-warning' : 'alert alert-info');
    el.innerHTML = `<div class="${cls} py-2 small mb-0">${html}</div>`;
}

function formatCurrencyInput(el) {
    const n = toNumber(el.value);
    if (!isFinite(n)) return;
    el.value = Math.round(n).toLocaleString('ko-KR');
}

// -- Policy Logic --
function policyByStartDate(startDateStr) {
    const d = new Date(startDateStr);
    if (isNaN(d)) return null;

    const d2024_07_01 = new Date('2024-07-01');
    const d2025_01_01 = new Date('2025-01-01');
    const d2026_01_01 = new Date('2026-01-01');

    if (d >= d2026_01_01) return { threshold: 10, capA: 2500000, capB: 1600000, floor: 500000 };
    if (d >= d2025_01_01) return { threshold: 10, capA: 2200000, capB: 1500000, floor: 500000 };
    if (d >= d2024_07_01) return { threshold: 10, capA: 2000000, capB: 1500000, floor: 500000 };
    return { threshold: 5, capA: 2000000, capB: 1500000, floor: 500000 };
}

function applyPolicyByDate() {
    if (!$('autoPolicy').checked) return;
    const start = $('startDate').value;
    const p = policyByStartDate(start);
    if (!p) return;

    $('threshold').value = p.threshold;
    $('capA').value = p.capA.toLocaleString('ko-KR');
    $('capB').value = p.capB.toLocaleString('ko-KR');
    $('floor').value = p.floor.toLocaleString('ko-KR');
}

// -- Ratio Logic --
function daysInMonth(year, month1to12) {
    return new Date(year, month1to12, 0).getDate();
}

function applyRatioByDates() {
    if (!$('autoRatio').checked) return;

    const s = new Date($('startDate').value);
    const e = new Date($('endDate').value);
    if (isNaN(s) || isNaN(e)) return;

    if (e < s) {
        setMsg('err', '종료일이 시작일보다 빠릅니다. 날짜를 확인해 주세요.');
        return;
    }

    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
        const year = s.getFullYear();
        const month = s.getMonth() + 1;
        const dim = daysInMonth(year, month);
        const days = Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1;
        const ratio = Math.max(0, Math.min(1, days / dim));
        $('ratio').value = ratio.toFixed(4);
    } else {
        setMsg('warn', '시작/종료일이 서로 다른 달입니다. 월별로 일할 계산이 필요하므로 자동 Ratio(단일값)는 적용되지 않습니다.');
    }
}

// -- Detailed Input Logic --
function makeIncomeRow(row = {}) {
    const tr = document.createElement('tr');

    // Name
    const tdName = document.createElement('td');
    const inName = document.createElement('input');
    inName.className = 'form-control form-control-sm border-0 bg-transparent text-center';
    inName.placeholder = '항목명';
    inName.value = row.name ?? '';
    tdName.appendChild(inName);

    // Amount
    const tdAmt = document.createElement('td');
    const inAmt = document.createElement('input');
    inAmt.className = 'form-control form-control-sm border-0 bg-transparent text-center fw-bold';
    inAmt.inputMode = 'numeric';
    inAmt.value = (row.amount ?? 0).toLocaleString('ko-KR');
    inAmt.addEventListener('blur', () => formatCurrencyInput(inAmt));
    tdAmt.appendChild(inAmt);

    // Is Ordinary Wage?
    const tdOrd = document.createElement('td');
    const selOrd = document.createElement('select');
    selOrd.className = 'form-select form-select-sm border-0 bg-transparent text-center';
    selOrd.innerHTML = `<option value="yes">포함</option><option value="no">미포함</option>`;
    selOrd.value = row.isOrdinary ? 'yes' : 'no';
    tdOrd.appendChild(selOrd);

    // Pay Mode
    const tdPay = document.createElement('td');
    const selPay = document.createElement('select');
    selPay.className = 'form-select form-select-sm border-0 bg-transparent text-center';
    selPay.innerHTML = `
        <option value="proportional">비례삭감</option>
        <option value="full">전액지급</option>
        <option value="zero">미지급</option>
      `;
    selPay.value = row.payMode ?? 'proportional';
    tdPay.appendChild(selPay);

    // Delete
    const tdDel = document.createElement('td');
    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn btn-link text-danger btn-sm p-0';
    btnDel.textContent = '×';
    btnDel.addEventListener('click', () => { tr.remove(); calc(); });
    tdDel.appendChild(btnDel);

    tr.appendChild(tdName);
    tr.appendChild(tdAmt);
    tr.appendChild(tdOrd);
    tr.appendChild(tdPay);
    tr.appendChild(tdDel);

    [inName, inAmt, selOrd, selPay].forEach(el => el.addEventListener('input', () => calc()));
    [selOrd, selPay].forEach(el => el.addEventListener('change', () => calc()));

    return tr;
}

function getDetailRows() {
    const tbody = $('incomeTbody');
    if (!tbody) return [];

    const rows = [];
    for (const tr of tbody.querySelectorAll('tr')) {
        const tds = tr.querySelectorAll('td');
        const name = tds[0].querySelector('input')?.value?.trim() || '';
        const amount = toNumber(tds[1].querySelector('input')?.value);
        const isOrdinary = (tds[2].querySelector('select')?.value === 'yes');
        const payMode = tds[3].querySelector('select')?.value || 'proportional';
        rows.push({ name, amount: isFinite(amount) ? amount : 0, isOrdinary, payMode });
    }
    return rows;
}

function loadExampleRows() {
    const tbody = $('incomeTbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const example = [
        { name: '기본급', amount: 2500000, isOrdinary: true, payMode: 'proportional' },
        { name: '직책수당', amount: 300000, isOrdinary: true, payMode: 'proportional' },
        { name: '식대', amount: 200000, isOrdinary: false, payMode: 'full' },
        { name: '교통비', amount: 100000, isOrdinary: false, payMode: 'full' }
    ];
    example.forEach(r => tbody.appendChild(makeIncomeRow(r)));
}

// -- Mode & UI Sync --
function getMode() { return $('modeDetail').checked ? 'detail' : 'direct'; }

function syncModeUI() {
    const mode = getMode();
    $('directBox').style.display = (mode === 'direct') ? 'block' : 'none';
    $('detailBox').style.display = (mode === 'detail') ? 'block' : 'none';
    calc();
}

function toggleCompanyBoxes(show) {
    if ($('companyBeforeBox')) $('companyBeforeBox').style.display = show ? '' : 'none';
    if ($('companyAfterBox')) $('companyAfterBox').style.display = show ? '' : 'none';
    if ($('sumBox')) $('sumBox').style.display = show ? '' : 'none';
}

// -- Main Calc --
function calc() {
    setMsg('', ''); // clear msg

    if ($('autoPolicy').checked) applyPolicyByDate();
    if ($('autoRatio').checked) applyRatioByDates();

    const H0 = toNumber($('h0').value);
    const H1 = toNumber($('h1').value);
    const ratio = toNumber($('ratio').value);

    const threshold = toNumber($('threshold').value);
    const pctB = toNumber($('pctB').value);
    const capA = toNumber($('capA').value);
    const capB = toNumber($('capB').value);
    const floor = toNumber($('floor').value);

    const mode = getMode();

    // Date Val
    const s = new Date($('startDate').value);
    const e = new Date($('endDate').value);
    if (!isNaN(s) && !isNaN(e) && e < s) {
        setMsg('err', '종료일이 시작일보다 빠릅니다.');
        return;
    }

    const errs = [];
    if (!(H0 > 0)) errs.push('H₀(단축 전 시간) > 0 이어야 합니다.');
    if (!(H1 > 0)) errs.push('H₁(단축 후 시간) > 0 이어야 합니다.');
    if (!(H1 <= H0)) errs.push('H₁은 H₀보다 작거나 같아야 합니다.');

    let W = NaN;
    let companyBefore = NaN;
    let companyAfter = NaN;
    let companyExplain = '';

    if (mode === 'direct') {
        const wage = toNumber($('wage').value);
        if (!(wage > 0)) errs.push('통상임금을 입력해주세요.');
        W = wage;

        const companyDirect = toNumber($('companyDirect').value);
        const baseCompany = (companyDirect > 0) ? companyDirect : wage;
        companyBefore = baseCompany * ratio;
        companyAfter = baseCompany * (H1 / H0) * ratio;
        companyExplain = (companyDirect > 0) ? '총액 입력값 기준' : '통상임금 기준 비례삭감 가정';
    } else {
        const rows = getDetailRows();
        if (rows.length === 0) errs.push('소득 항목을 추가해주세요.');

        const sumOrd = rows.reduce((acc, r) => acc + (r.isOrdinary ? r.amount : 0), 0);
        const sumAll = rows.reduce((acc, r) => acc + r.amount, 0);

        W = sumOrd;
        companyBefore = sumAll * ratio;

        const factor = (H1 / H0);
        const after = rows.reduce((acc, r) => {
            if (r.payMode === 'proportional') return acc + r.amount * factor;
            if (r.payMode === 'full') return acc + r.amount;
            return acc;
        }, 0);
        companyAfter = after * ratio;

        if (!(W > 0)) errs.push('통상임금(포함 항목)이 0원입니다.');
        companyExplain = '상세 항목별 지급 기준 적용';
    }

    if (errs.length) {
        setMsg('err', errs.join('<br>'));
        return;
    }

    const R = H0 - H1;

    // Output Mapping
    const setTxt = (id, txt) => { if ($(id)) $(id).textContent = txt; };

    if (!(R > 0)) {
        // Not reduced
        setTxt('outW', fmtWon(W));
        setTxt('outR', '0시간');
        setTxt('outTotal', fmtWon(0));

        // Reset Gov display
        setTxt('detailA', fmtWon(0));
        setTxt('detailB', fmtWon(0));
        setTxt('totalResult', fmtWon(0));

        if ($('showCompany').checked) {
            setTxt('resCompany', fmtWon(companyAfter));
            setTxt('resGov', fmtWon(0));
            setTxt('finalTotalIncome', fmtWon(companyAfter));
        }
        return;
    }

    // Benefit Calc
    const Ahrs = Math.min(threshold, R);
    const Bhrs = Math.max(R - threshold, 0);

    const baseA = Math.min(W, capA);
    const baseB = Math.min(W * pctB, capB);

    const A = baseA * (Ahrs / H0);
    const B = baseB * (Bhrs / H0);

    const rawTotal = (A + B) * ratio;
    const minTotal = floor * ratio;
    let benefit = Math.max(rawTotal, minTotal);

    // Offset (Reduction) Logic
    if ($('applyOffset').checked) {
        const offsetBaseRaw = toNumber($('offsetBase').value);
        const base = (offsetBaseRaw > 0) ? offsetBaseRaw : W;
        const baseForMonth = base * ratio;

        const sum = companyAfter + benefit;
        if (sum > baseForMonth) {
            const over = sum - baseForMonth;
            benefit = Math.max(0, benefit - over);
        }
    }

    // --- Update UI ---

    // 1. Result Display (Main Card)
    setTxt('totalResult', fmtWon(benefit)); // Main Big Number

    // 2. Detail Popover/Collapse
    setTxt('detailA', fmtWon(A * ratio));
    setTxt('detailB', fmtWon(B * ratio));
    setTxt('resGov', fmtWon(benefit)); // In "Total Income" card

    // 3. Company & Sum (Total Income Card)
    if ($('showCompany').checked) {
        setTxt('resCompany', fmtWon(companyAfter));
        setTxt('finalTotalIncome', fmtWon(companyAfter + benefit)); // Grand Total

        if ($('detailPreWage')) $('detailPreWage').textContent = fmtWon(companyBefore);
        if ($('detailRatio')) $('detailRatio').textContent = Math.round((H1 / H0) * 100) + '%';
    }

    // 4. Debug/Raw Grid (Optional, if we keep the grid for debugging)
    setTxt('outW', fmtWon(W));
    setTxt('outR', `${R}시간`);
}

// -- Init --
function initEvents() {
    const changes = ['startDate', 'endDate', 'h0', 'h1', 'ratio', 'threshold', 'pctB', 'capA', 'capB', 'floor', 'offsetBase', 'wage', 'companyDirect'];
    changes.forEach(id => {
        if ($(id)) {
            $(id).addEventListener('input', calc);
            $(id).addEventListener('change', calc);
        }
    });

    ['modeDirect', 'modeDetail'].forEach(id => $(id)?.addEventListener('change', syncModeUI));
    ['autoPolicy', 'autoRatio', 'applyOffset', 'showCompany'].forEach(id => $(id)?.addEventListener('change', calc));

    $('addRowBtn')?.addEventListener('click', () => {
        $('incomeTbody').appendChild(makeIncomeRow({ name: '', amount: 0, isOrdinary: false, payMode: 'proportional' }));
        calc();
    });
    $('loadExampleBtn')?.addEventListener('click', () => { loadExampleRows(); calc(); });
    $('resetBtn')?.addEventListener('click', reset);

    // Initial Load
    loadExampleRows();
    syncModeUI();

    // Auto Policy on start
    if ($('autoPolicy').checked) applyPolicyByDate();
    if ($('autoRatio').checked) applyRatioByDates();

    calc();
}

function reset() {
    $('startDate').value = '2026-01-01';
    $('endDate').value = '2026-01-31';
    $('h0').value = 40;
    $('h1').value = 30;
    $('autoPolicy').checked = true;
    $('autoRatio').checked = true;
    $('ratio').value = 1;
    $('modeDirect').checked = true;
    $('wage').value = '3,000,000';
    $('companyDirect').value = '';
    loadExampleRows();
    $('applyOffset').checked = false;
    $('showCompany').checked = true;

    applyPolicyByDate();
    syncModeUI();
}

// Start
document.addEventListener('DOMContentLoaded', initEvents);
