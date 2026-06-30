import { formatCoins, formatWon } from "../utils.js";
import { els } from "./elements.js";

export function setProfileExpanded(value) {
  els.profileSummary.classList.toggle("expanded", value);
  els.profileToggle.setAttribute("aria-expanded", String(value));
}

export function toggleProfile() {
  setProfileExpanded(!els.profileSummary.classList.contains("expanded"));
}

export function setPlayerName(name) {
  els.playerName.textContent = name;
}

export function renderProfile(profile) {
  if (!profile) return;

  els.playerName.textContent = profile.displayName;
  els.cashBalance.textContent = formatWon(profile.cashWon);
  els.coinBalance.textContent = formatCoins(profile.coinBalance);
  els.totalEquity.textContent = formatWon(profile.totalEquity);

  if (profile.positionSymbol) {
    els.positionBox.classList.add("active");
    els.positionBox.classList.remove("empty");
    els.positionTitle.textContent = `${profile.positionCompany || profile.positionSymbol} 보유 중`;
    els.positionText.textContent = `${profile.shares.toFixed(6)}주 · 평균 ${formatWon(profile.avgPrice)} · 현재 평가 ${formatWon(profile.positionValue)}`;
    delete els.sellBtn.dataset.blocked;
    els.sellBtn.disabled = false;
    return;
  }

  els.positionBox.classList.remove("active");
  els.positionBox.classList.add("empty");
  els.positionTitle.textContent = "보유 주식 없음";
  els.positionText.textContent = profile.canInvest ? "투자할 회사의 투자 버튼을 눌러 매수 금액을 입력하십시오." : "다음 오전 9시 갱신 이후 다시 투자할 수 있습니다.";
  els.sellBtn.dataset.blocked = "true";
  els.sellBtn.disabled = true;
}
