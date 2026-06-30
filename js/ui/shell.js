import { toPositiveInt } from "../utils.js";
import { els, exchangeButtons } from "./elements.js";

export function setLog(message) {
  els.systemLog.textContent = message;
}

export function setBusyView(busy, locked) {
  const disabled = Boolean(busy || locked);
  els.exchangeBtn.disabled = disabled;
  els.sellBtn.disabled = disabled || els.sellBtn.dataset.blocked === "true";
  exchangeButtons.forEach((node) => {
    node.disabled = disabled;
  });
  els.marketList.querySelectorAll("button,input").forEach((node) => {
    node.disabled = disabled || node.dataset.blocked === "true";
  });
}

export function showLocked() {
  document.body.classList.add("locked");
  els.portalLock.classList.remove("hidden");
  els.sessionStatus.textContent = "LOCKED";
  els.playerName.textContent = "PORTAL REQUIRED";
  els.selfRank.textContent = "포털 로그인 필요";
  setLog("867988 메인 포털 로그인 세션을 찾지 못했습니다.");
}

export function showActive() {
  document.body.classList.remove("locked");
  els.portalLock.classList.add("hidden");
  els.sessionStatus.textContent = "ACTIVE";
}

export function readExchangeAmount() {
  return toPositiveInt(els.exchangeAmount.value);
}

export function writeExchangeAmount(value) {
  els.exchangeAmount.value = value ? String(value) : "";
}
