import { RANK_LIMIT } from "../config.js";
import { formatWon } from "../utils.js";
import { div, playerKeyOf, rankValue } from "./dom.js";
import { els } from "./elements.js";

function createRankRow(row, playerKey) {
  const item = document.createElement("div");
  const isSelf = playerKeyOf(row) === playerKey;
  item.className = `rank-row${isSelf ? " self" : ""}`;
  item.append(
    div("rank-no", String(rankValue(row) || "--")),
    div("rank-name", row.display_name || row.displayName || "UNKNOWN"),
    div("rank-value", formatWon(row.total_equity ?? row.totalEquity))
  );
  return item;
}

export function renderLeaderboard(rows, playerKey) {
  const list = Array.isArray(rows) ? rows : [];
  const topRows = list
    .filter((row) => rankValue(row) > 0 && rankValue(row) <= RANK_LIMIT)
    .sort((a, b) => rankValue(a) - rankValue(b));
  const selfRow = list.find((row) => playerKeyOf(row) === playerKey);

  if (topRows.length) {
    els.rankList.replaceChildren(...topRows.map((row) => createRankRow(row, playerKey)));
  } else {
    const empty = document.createElement("div");
    empty.className = "rank-row";
    empty.append(div("rank-no", "--"), div("rank-name", "NO DATA"), div("rank-value", "0원"));
    els.rankList.replaceChildren(empty);
  }

  els.selfRank.textContent = selfRow ? `${rankValue(selfRow)}위 · ${formatWon(selfRow.total_equity ?? selfRow.totalEquity)}` : "순위 산출 대기";
}
