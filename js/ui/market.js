import { formatPercent, formatWon } from "../utils.js";
import { actionButton, companyName, div, isPositiveChange, marketSymbol, newsKind } from "./dom.js";
import { els } from "./elements.js";
import { closeStockOrders, createOrderPanel } from "./orders.js";

function createStockCard(row, canInvest, positionSymbol = "") {
  const symbol = marketSymbol(row);
  const kind = newsKind(row);
  const card = document.createElement("article");
  card.className = `stock-card ${kind}`;
  card.dataset.stockSymbol = symbol;

  const top = document.createElement("div");
  top.className = "stock-top";

  const nameBox = document.createElement("div");
  nameBox.append(
    div("stock-symbol", symbol),
    div("stock-name", companyName(row))
  );

  const priceBox = document.createElement("div");
  priceBox.append(
    div("stock-price", formatWon(row.price)),
    div(`stock-change ${isPositiveChange(row) ? "up" : "down"}`, formatPercent(row.change_rate ?? row.changeRate))
  );

  top.append(nameBox, priceBox);

  const news = document.createElement("div");
  news.className = "stock-news";
  news.append(
    div("stock-kind", kind || "market"),
    Object.assign(document.createElement("strong"), { textContent: row.news_title || row.newsTitle || "Market update" }),
    Object.assign(document.createElement("p"), { textContent: row.news_body || row.newsBody || "" })
  );

  const canBuyThis = Boolean(canInvest) && (!positionSymbol || positionSymbol === symbol);
  const buttonText = canBuyThis ? "투자" : (positionSymbol && positionSymbol !== symbol ? "보유 종목만 가능" : "투자");
  const openButton = actionButton("stock-order-open", buttonText, { orderOpen: symbol });
  openButton.disabled = !canBuyThis;
  if (!canBuyThis) openButton.dataset.blocked = "true";

  card.append(top, news, openButton, createOrderPanel(symbol));
  return card;
}

export function renderMarket(rows, canInvest, positionSymbol = "") {
  const list = Array.isArray(rows) ? rows : [];
  closeStockOrders();

  if (!list.length) {
    const empty = document.createElement("article");
    empty.className = "stock-card";
    empty.append(div("stock-name", "NO MARKET DATA"));
    els.marketList.replaceChildren(empty);
    return;
  }

  els.marketList.replaceChildren(...list.map((row) => createStockCard(row, canInvest, positionSymbol)));
}
