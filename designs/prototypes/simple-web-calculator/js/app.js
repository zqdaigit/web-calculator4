(() => {
  const MAX_LENGTH = 12;
  const HISTORY_KEY = "simple-calculator-history";
  const state = { operand1: "0", operand2: null, operator: null, locked: false, justCalculated: false };
  let history = readHistory();

  const expression = document.querySelector("#expression");
  const result = document.querySelector("#result");
  const keys = [...document.querySelectorAll(".calc-key")];
  const historyList = document.querySelector("#historyList");
  const historyToggle = document.querySelector(".history-toggle");
  const shortcutsModal = document.querySelector("#shortcutsModal");
  const confirmModal = document.querySelector("#confirmModal");

  const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  const keyboardMap = {
    Enter: "equals", "=": "equals", Backspace: "backspace", Delete: "backspace",
    Escape: "ac", c: "clear", C: "clear", "%": "percent",
    "+": "+", "-": "-", "*": "*", "/": "/", ".": "."
  };
  for (let i = 0; i <= 9; i += 1) keyboardMap[String(i)] = String(i);

  function currentField() { return state.operator ? "operand2" : "operand1"; }
  function currentValue() { return state[currentField()] ?? "0"; }
  function setCurrent(value) { state[currentField()] = String(value); }
  function formatNumber(value) {
    const number = Number(value);
    if (Math.abs(number) >= 1e15) return number.toExponential(8).replace(/\.?0+e/, "e");
    return String(Number(number.toFixed(10)));
  }
  function expressionText() {
    if (!state.operator) return state.justCalculated ? "" : state.operand1 === "0" ? "" : state.operand1;
    return `${state.operand1} ${symbols[state.operator]} ${state.operand2 ?? ""}`;
  }
  function updateDisplay() {
    expression.textContent = state.locked ? "请按 AC 解锁" : expressionText() || "\u00a0";
    result.textContent = state.locked ? state.operand1 : currentValue();
    keys.forEach((key) => {
      key.disabled = state.locked && key.dataset.action !== "ac";
      key.setAttribute("aria-disabled", String(key.disabled));
    });
  }
  function resetAll() {
    Object.assign(state, { operand1: "0", operand2: null, operator: null, locked: false, justCalculated: false });
    updateDisplay();
  }
  function lockWith(message) {
    Object.assign(state, { operand1: message, operand2: null, operator: null, locked: true, justCalculated: false });
    updateDisplay();
  }
  function validateSafe(value) {
    if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
      lockWith("Error: Overflow");
      return false;
    }
    return true;
  }
  function inputDigit(digit) {
    if (state.justCalculated && !state.operator) resetAll();
    const value = currentValue();
    if (value.length >= MAX_LENGTH) return;
    setCurrent(value === "0" ? digit : value + digit);
    state.justCalculated = false;
    if (!validateSafe(Number(currentValue()))) return;
    updateDisplay();
  }
  function inputDecimal() {
    if (state.justCalculated && !state.operator) resetAll();
    const value = currentValue();
    if (value.includes(".") || value.length >= MAX_LENGTH) return;
    setCurrent(value + ".");
    state.justCalculated = false;
    updateDisplay();
  }
  function setOperator(operator) {
    if (state.operator && state.operand2 !== null) {
      calculate(false);
      if (state.locked) return;
    }
    state.operator = operator;
    state.operand2 = null;
    state.justCalculated = false;
    updateDisplay();
  }
  function calculate(addToHistory = true) {
    if (!state.operator || state.operand2 === null) return;
    const left = Number(state.operand1);
    const right = Number(state.operand2);
    const formula = `${state.operand1} ${symbols[state.operator]} ${state.operand2}`;
    if (state.operator === "/" && right === 0) return lockWith("Error");
    let value;
    if (state.operator === "+") value = left + right;
    if (state.operator === "-") value = left - right;
    if (state.operator === "*") value = left * right;
    if (state.operator === "/") value = left / right;
    if (!validateSafe(value)) return;
    const formatted = formatNumber(value);
    Object.assign(state, { operand1: formatted, operand2: null, operator: null, justCalculated: true });
    if (addToHistory) addHistory(formula, formatted);
    updateDisplay();
  }
  function clearCurrent() {
    setCurrent("0");
    state.justCalculated = false;
    updateDisplay();
  }
  function backspace() {
    let value = currentValue();
    if (state.justCalculated) return resetAll();
    value = value.length <= 1 || (value.startsWith("-") && value.length === 2) ? "0" : value.slice(0, -1);
    setCurrent(value);
    updateDisplay();
  }
  function transformCurrent(kind) {
    let value = Number(currentValue());
    if (kind === "percent") value /= 100;
    if (kind === "negate") value *= -1;
    const formatted = formatNumber(value);
    if (formatted.length > MAX_LENGTH || !validateSafe(value)) return;
    setCurrent(formatted);
    state.justCalculated = false;
    updateDisplay();
  }
  function handleAction(action, value) {
    if (state.locked && action !== "ac") return;
    if (action === "digit") inputDigit(value);
    if (action === "decimal") inputDecimal();
    if (action === "operator") setOperator(value);
    if (action === "equals") calculate();
    if (action === "clear") clearCurrent();
    if (action === "ac") resetAll();
    if (action === "backspace") backspace();
    if (action === "percent" || action === "negate") transformCurrent(action);
  }

  function readHistory() {
    try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
  }
  function saveHistory() { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }
  function addHistory(formula, value) {
    history.unshift({ formula, value, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) });
    history = history.slice(0, 30);
    saveHistory();
    renderHistory();
  }
  function renderHistory() {
    historyList.replaceChildren();
    if (!history.length) {
      historyList.innerHTML = '<div class="empty-state"><p><b>◷</b>无历史记录</p></div>';
      document.querySelector("#clearHistory").disabled = true;
      return;
    }
    document.querySelector("#clearHistory").disabled = false;
    history.forEach((item) => {
      const button = document.createElement("button");
      button.className = "history-item";
      button.type = "button";
      button.innerHTML = `${item.formula}<span>= ${item.value}</span>`;
      button.addEventListener("click", () => {
        Object.assign(state, { operand1: item.value, operand2: null, operator: null, locked: false, justCalculated: true });
        updateDisplay();
        if (innerWidth < 480) toggleHistory(false);
      });
      historyList.append(button);
    });
  }
  function toggleHistory(force) {
    const open = typeof force === "boolean" ? force : !document.body.classList.contains("history-open");
    document.body.classList.toggle("history-open", open);
    historyToggle.setAttribute("aria-expanded", String(open));
  }
  function openModal(modal, open) {
    modal.classList.toggle("open", open);
    modal.setAttribute("aria-hidden", String(!open));
  }
  function showToast() {
    const host = document.querySelector("#toastHost");
    host.replaceChildren();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = "结果已复制到剪贴板";
    host.append(toast);
    setTimeout(() => toast.classList.add("fade"), 2000);
    setTimeout(() => toast.remove(), 2300);
  }
  async function copyResult() {
    if (state.locked) return;
    try { await navigator.clipboard.writeText(result.textContent); } catch {
      const area = document.createElement("textarea");
      area.value = result.textContent;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    showToast();
  }
  function keyElement(mapped) {
    if (/^\d$/.test(mapped)) return document.querySelector(`[data-action="digit"][data-value="${mapped}"]`);
    if (["+", "-", "*", "/"].includes(mapped)) return document.querySelector(`[data-action="operator"][data-value="${mapped}"]`);
    if (mapped === ".") return document.querySelector('[data-action="decimal"]');
    return document.querySelector(`[data-action="${mapped}"]`);
  }
  function performMapped(mapped) {
    if (/^\d$/.test(mapped)) handleAction("digit", mapped);
    else if (["+", "-", "*", "/"].includes(mapped)) handleAction("operator", mapped);
    else if (mapped === ".") handleAction("decimal");
    else handleAction(mapped);
  }

  keys.forEach((key) => key.addEventListener("click", () => handleAction(key.dataset.action, key.dataset.value)));
  historyToggle.addEventListener("click", () => toggleHistory());
  document.querySelectorAll(".history-close").forEach((button) => button.addEventListener("click", () => toggleHistory(false)));
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });
  document.querySelector(".shortcuts-toggle").addEventListener("click", () => openModal(shortcutsModal, true));
  document.querySelectorAll(".modal-close").forEach((button) => button.addEventListener("click", () => openModal(shortcutsModal, false)));
  shortcutsModal.addEventListener("click", (event) => { if (event.target === shortcutsModal) openModal(shortcutsModal, false); });
  document.querySelector("#clearHistory").addEventListener("click", () => openModal(confirmModal, true));
  document.querySelector("#cancelClear").addEventListener("click", () => openModal(confirmModal, false));
  document.querySelector("#confirmClear").addEventListener("click", () => {
    history = [];
    sessionStorage.removeItem(HISTORY_KEY);
    renderHistory();
    openModal(confirmModal, false);
  });
  confirmModal.addEventListener("click", (event) => { if (event.target === confirmModal) openModal(confirmModal, false); });
  result.addEventListener("click", copyResult);
  window.addEventListener("keydown", (event) => {
    if (event.repeat || document.querySelector(".modal-layer.open")) return;
    const mapped = keyboardMap[event.key];
    if (!mapped) return;
    event.preventDefault();
    if (state.locked && mapped !== "ac") return;
    keyElement(mapped)?.classList.add("active");
    performMapped(mapped);
  });
  window.addEventListener("keyup", (event) => {
    const mapped = keyboardMap[event.key];
    if (mapped) keyElement(mapped)?.classList.remove("active");
  });
  window.addEventListener("blur", () => keys.forEach((key) => key.classList.remove("active")));

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  renderHistory();
  updateDisplay();
})();
