import { toPositiveInt } from "../utils.js";
import { els } from "./elements.js";
import { actionButton } from "./dom.js";

let activeOrderSymbol = "";

function stockSelector(symbol) {
  return `[data-stock-symbol="${CSS.escape(symbol)}"]`;
}

function cardBySymbol(symbol) {
  return symbol ? els.marketList.querySelector(stockSelector(symbol)) : null;
}

function inputBySymbol(symbol) {
  const card = cardBySymbol(symbol);
  return card ? card.querySelector("[data-invest-input]") : null;
}

export function closeStockOrders() {
  activeOrderSymbol = "";
  els.marketList.querySelectorAll(".stock-card.ordering").forEach((card) => {
    card.classList.remove("ordering");
  });
  els.marketList.querySelectorAll(".stock-order").forEach((panel) => {
    panel.hidden = true;
  });
  els.marketList.querySelectorAll("[data-order-open]").forEach((node) => {
    node.textContent = "투자";
  });
}

export function openStockOrder(symbol) {
  const card = cardBySymbol(symbol);
  if (!card) return;

  closeStockOrders();

  const panel = card.querySelector(".stock-order");
  const input = card.querySelector("[data-invest-input]");
  const opener = card.querySelector("[data-order-open]");

  activeOrderSymbol = symbol;
  card.classList.add("ordering");
  panel.hidden = false;
  opener.textContent = "코인 입력 중";
  requestAnimationFrame(() => input.focus());
}

export function createOrderPanel(symbol) {
  const panel = document.createElement("div");
  panel.className = "stock-order";
  panel.hidden = true;

  const label = document.createElement("label");
  label.textContent = "매수 코인";

  const input = document.createElement("input");
  input.type = "number";
  input.inputMode = "numeric";
  input.min = "1";
  input.step = "1";
  input.placeholder = "코인 입력";
  input.dataset.symbol = symbol;
  input.dataset.investInput = "true";

  const shortcuts = document.createElement("div");
  shortcuts.className = "stock-order-shortcuts";
  shortcuts.append(
    actionButton("", "10,000", { investFill: "10000", symbol }),
    actionButton("", "50,000", { investFill: "50000", symbol }),
    actionButton("", "HALF", { investFill: "half", symbol }),
    actionButton("", "MAX", { investFill: "max", symbol })
  );

  const actions = document.createElement("div");
  actions.className = "stock-order-actions";
  actions.append(
    actionButton("stock-order-submit", "매수 실행", { buySubmit: symbol }),
    actionButton("stock-order-cancel", "취소", { orderCancel: symbol })
  );

  panel.append(label, input, shortcuts, actions);
  return panel;
}

export function readInvestAmount(symbol = activeOrderSymbol) {
  const input = inputBySymbol(symbol);
  return input ? toPositiveInt(input.value) : 0;
}

export function writeInvestAmount(symbol, value) {
  const input = inputBySymbol(symbol);
  if (input) input.value = value ? String(value) : "";
}
