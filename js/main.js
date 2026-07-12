import { PORTAL_STORAGE_KEY } from "./config.js";
import { fetchLeaderboard, fetchMarket, fetchProfile, requestBuy, requestSell } from "./api.js";
import { loadPortalIdentity } from "./session.js";
import { applyProfile, getState, setBusy, setIdentity, setLocked } from "./state.js";
import { errorText, formatCoinAmount } from "./utils.js";
import {
  bindViewEvents,
  readInvestAmount,
  renderLeaderboard,
  renderMarket,
  renderProfile,
  setBusyView,
  setLog,
  setPlayerName,
  showActive,
  showLocked,
  writeInvestAmount
} from "./view.js";

let marketRows = [];

function syncBusy(value) {
  setBusy(value);
  const state = getState();
  setBusyView(state.busy, state.locked);
}

function lockTerminal() {
  setLocked(true);
  syncBusy(false);
  showLocked();
  setBusyView(false, true);
}

function unlockTerminal() {
  setLocked(false);
  showActive();
  setBusyView(false, false);
}

function updateProfile(profile) {
  const current = applyProfile(profile);
  renderProfile(current);
  renderMarket(marketRows, current.canInvest, current.positionSymbol);
  return current;
}

async function refreshMarket() {
  marketRows = await fetchMarket();
  renderMarket(marketRows, getState().canInvest, getState().positionSymbol);
}

async function refreshLeaderboard() {
  const state = getState();
  const rows = await fetchLeaderboard(state.playerKey);
  renderLeaderboard(rows, state.playerKey);
}

async function refreshProfile() {
  const state = getState();
  const profile = await fetchProfile(state.playerKey, state.displayName);
  updateProfile(profile);
}

async function refreshAll() {
  await refreshMarket();
  await refreshProfile();
  await refreshLeaderboard();
}

async function buyStock(symbol) {
  const state = getState();
  if (state.busy || state.locked) return;

  const amount = readInvestAmount(symbol);
  if (!state.canInvest) {
    setLog("오늘의 투자권은 이미 사용되었습니다.");
    return;
  }
  if (state.positionSymbol && state.positionSymbol !== symbol) {
    setLog("보유 중인 종목에만 추가 투자할 수 있습니다.");
    return;
  }
  if (!amount) {
    setLog("매수할 코인을 입력하십시오.");
    return;
  }
  if (amount > state.balance) {
    setLog("보유 코인보다 큰 금액은 투자할 수 없습니다.");
    return;
  }

  syncBusy(true);
  try {
    const profile = await requestBuy(state.playerKey, state.displayName, symbol, amount);
    updateProfile(profile);
    writeInvestAmount(symbol, "");
    await refreshLeaderboard();
    setLog(`${symbol} 매수 처리 완료. 투자 금액 ${formatCoinAmount(amount)}.`);
  } catch (error) {
    const message = errorText(error);
    if (message.includes("DAILY_INVEST_USED")) {
      setLog("오늘의 투자권은 이미 사용되었습니다.");
    } else if (message.includes("ONLY_SAME_SYMBOL_ALLOWED") || message.includes("ACTIVE_POSITION_EXISTS")) {
      setLog("보유 중인 종목에만 추가 투자할 수 있습니다.");
    } else if (message.includes("NOT_ENOUGH_COINS") || message.includes("NOT_ENOUGH_CASH")) {
      setLog("보유 코인이 부족합니다.");
    } else {
      setLog(`매수 처리 실패: ${message}`);
    }
  } finally {
    syncBusy(false);
  }
}

async function sellStock() {
  const state = getState();
  if (state.busy || state.locked) return;
  if (!state.positionSymbol) {
    setLog("매도할 보유 주식이 없습니다.");
    return;
  }

  syncBusy(true);
  try {
    const symbol = state.positionSymbol;
    const profile = await requestSell(state.playerKey, state.displayName);
    updateProfile(profile);
    await refreshLeaderboard();
    setLog(`${symbol} 매도 처리 완료. 매도 금액이 코인 잔액에 반영되었습니다.`);
  } catch (error) {
    const message = errorText(error);
    setLog(message.includes("NO_ACTIVE_POSITION") ? "매도할 보유 주식이 없습니다." : `매도 처리 실패: ${message}`);
  } finally {
    syncBusy(false);
  }
}

function fillInvest(symbol, type) {
  const state = getState();
  if (state.locked) return;

  const fixedAmount = Number(type);
  const amount = type === "half"
    ? Math.floor(state.balance / 2)
    : type === "max"
      ? state.balance
      : fixedAmount;

  writeInvestAmount(symbol, Math.min(Math.max(1, amount), state.balance));
}

function normalizeInvestInput(symbol) {
  writeInvestAmount(symbol, readInvestAmount(symbol));
}

function openOrder(symbol) {
  setLog(`${symbol}에 투자할 코인을 입력하십시오.`);
}

async function boot() {
  bindViewEvents({
    buy: buyStock,
    sell: sellStock,
    fillInvest,
    investInput: normalizeInvestInput,
    orderOpen: openOrder
  });

  window.addEventListener("storage", (event) => {
    if (event.key === PORTAL_STORAGE_KEY) location.reload();
  });

  const identity = loadPortalIdentity();
  if (!identity) {
    lockTerminal();
    return;
  }

  setIdentity(identity);
  setPlayerName(identity.displayName);
  unlockTerminal();

  syncBusy(true);
  try {
    await refreshAll();
    setLog("시장 세션 확인 완료. 보유 코인으로 바로 투자할 수 있습니다.");
  } catch (error) {
    setLog(`Supabase 연결 실패: ${errorText(error)}`);
  } finally {
    syncBusy(false);
  }
}

boot();
