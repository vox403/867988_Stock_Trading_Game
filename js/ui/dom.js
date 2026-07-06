import { toInt } from "../utils.js";

export function createNode(tagName, className = "", text = "") {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== "") node.textContent = text;
  return node;
}

export function div(className, text) {
  return createNode("div", className, text);
}

export function actionButton(className, text, data = {}) {
  const node = createNode("button", className, text);
  node.type = "button";
  Object.entries(data).forEach(([key, value]) => {
    node.dataset[key] = value;
  });
  return node;
}

export function rankValue(row) {
  return toInt(row.rank_position ?? row.rankPosition, 0);
}

export function playerKeyOf(row) {
  return String(row.player_key ?? row.playerKey ?? "");
}

export function newsKind(row) {
  return String(row.news_kind ?? row.newsKind ?? "").toLowerCase();
}

export function marketSymbol(row) {
  return String(row.symbol || "").trim();
}

export function companyName(row) {
  return row.company_name || row.companyName || row.symbol || "UNKNOWN";
}

export function isPositiveChange(row) {
  return Number(row.change_rate ?? row.changeRate ?? 0) >= 0;
}
