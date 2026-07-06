import { els, exchangeButtons } from "./elements.js";
import { closeStockOrders, openStockOrder } from "./orders.js";
import { setProfileExpanded, toggleProfile } from "./profile.js";

export function bindViewEvents(handlers) {
  setProfileExpanded(false);

  els.profileToggle.addEventListener("click", toggleProfile);
  els.exchangeBtn.addEventListener("click", handlers.exchange);
  els.sellBtn.addEventListener("click", handlers.sell);
  els.exchangeAmount.addEventListener("input", handlers.exchangeInput);

  exchangeButtons.forEach((node) => {
    node.addEventListener("click", () => handlers.fillExchange(node.dataset.exchangeFill));
  });

  els.marketList.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-order-open]");
    const submitter = event.target.closest("[data-buy-submit]");
    const shortcut = event.target.closest("[data-invest-fill]");
    const cancel = event.target.closest("[data-order-cancel]");

    if (opener) {
      openStockOrder(opener.dataset.orderOpen);
      handlers.orderOpen(opener.dataset.orderOpen);
      return;
    }

    if (submitter) {
      handlers.buy(submitter.dataset.buySubmit);
      return;
    }

    if (shortcut) {
      handlers.fillInvest(shortcut.dataset.symbol, shortcut.dataset.investFill);
      return;
    }

    if (cancel) closeStockOrders();
  });

  els.marketList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-invest-input]");
    if (input) handlers.investInput(input.dataset.symbol);
  });
}
