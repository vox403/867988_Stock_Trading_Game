import { RANK_LIMIT } from "../config.js";
import { div, playerKeyOf, rankValue } from "./dom.js";
import { els } from "./elements.js";

function field(row, snakeName, camelName) {
  return row[snakeName] ?? row[camelName] ?? "";
}

function shareCount(row) {
  const value = Number(field(row, "shares", "shares"));
  return Number.isFinite(value) ? value : 0;
}

function companyLabel(row) {
  return String(field(row, "position_company", "positionCompany") || field(row, "position_symbol", "positionSymbol") || "").trim();
}

function gradeByShares(shares) {
  if (shares >= 50) return "대주주";
  if (shares >= 20) return "핵심주주";
  if (shares > 0) return "일반주주";
  return "보유 주식 없음";
}

function holdingLabel(row) {
  const shares = shareCount(row);
  if (shares <= 0) return "보유 주식 없음";

  const company = companyLabel(row);
  const grade = String(field(row, "shareholder_grade", "shareholderGrade") || gradeByShares(shares)).trim();
  return company ? `${company} · ${grade}` : grade;
}

function createRankRow(row, playerKey) {
  const item = document.createElement("div");
  const main = document.createElement("div");
  const isSelf = playerKeyOf(row) === playerKey;

  item.className = `rank-row${isSelf ? " self" : ""}`;
  main.className = "rank-main";
  main.append(
    div("rank-name", row.display_name || row.displayName || "UNKNOWN"),
    div("rank-status", holdingLabel(row))
  );
  item.append(div("rank-no", String(rankValue(row) || "--")), main);
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
    const main = document.createElement("div");
    empty.className = "rank-row";
    main.className = "rank-main";
    main.append(div("rank-name", "NO DATA"), div("rank-status", "보유 주식 없음"));
    empty.append(div("rank-no", "--"), main);
    els.rankList.replaceChildren(empty);
  }

  els.selfRank.textContent = selfRow ? `${rankValue(selfRow)}위 · ${holdingLabel(selfRow)}` : "순위 산출 대기";
}
