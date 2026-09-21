"use strict";
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const paths = {
  book: "M4 4h6c1.5 0 2 1 2 2v15c0-2-2-3-4-3H4V4Zm16 0h-6c-1.5 0-2 1-2 2m0 15c0-2 2-3 4-3h4V4Z",
  file: "M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8M8 16h6",
  grid: "M4 4h6v6H4Zm10 0h6v6h-6ZM4 14h6v6H4Zm10 0h6v6h-6Z",
  dna: "M7 3c0 8 10 10 10 18M17 3c0 8-10 10-10 18M8 6h8M8 18h8M8.5 11h7M8.5 13h7",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm5-1.5L21 21",
  plus: "M12 5v14M5 12h14",
  down: "m8 10 4 4 4-4",
  right: "m10 7 5 5-5 5",
  left: "m14 7-5 5 5 5",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  download: "M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5",
  upload: "M12 16V4m-5 5 5-5 5 5M4 15v5h16v-5",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z",
  panel: "M3 4h18v16H3ZM9 4v16",
  menu: "M4 6h16M4 12h16M4 18h16",
  clock: "M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
  light: "M9 18h6M10 21h4M8 15c0-2-3-3-3-6a7 7 0 0 1 14 0c0 3-3 4-3 6v1H8v-1Z",
  pen: "m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z",
  grip: "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
  list: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  table: "M3 4h18v16H3ZM3 9h18M3 14h18M10 4v16",
  link: "m10 13 4-4M8 15l-2 2a3.5 3.5 0 0 1-5-5l5-5a3.5 3.5 0 0 1 5 0m2 2 2-2a3.5 3.5 0 0 1 5 5l-5 5a3.5 3.5 0 0 1-5 0",
  copy: "M8 8h12v13H8ZM4 16H3V3h12v1",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  layout: "M4 4h16v16H4ZM4 9h16M10 9v11",
  refresh: "M20 8a8 8 0 1 0 1 7M20 3v5h-5",
  lock: "M6 10h12v11H6ZM8 10V6a4 4 0 0 1 8 0v4",
  expand: "M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5",
  text: "M4 5h16M12 5v15M8 20h8",
  move: "M12 3v18m-4-4 4 4 4-4M8 7l4-4 4 4",
  history: "M4 7V3m0 4h4M4 7a9 9 0 1 1-1 8M12 7v6l3 2",
};
function icon(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.file}"/></svg>`;
}
const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
const defaultDNA = {
  density: 2,
  formats: ["글머리표", "표"],
  difficulty: "쉽게 풀어서",
  research: "balanced",
  formula: "수식 + 설명",
  bold: true,
  star: true,
  pages: true,
  examples: true,
  dedupe: false,
  prompt:
    "정의는 교수님 표현을 유지하고, 시험에 중요한 내용은 별표로 표시해줘.",
  learn: true,
  classWeight: 2,
  classPriority: 2,
  classEmphasis: true,
};
const seedNotes = [
  {
    id: "os-07",
    title: "가상 메모리와 페이지 교체",
    shortTitle: "07. 가상 메모리",
    subject: "운영체제",
    week: "07",
    file: "Lecture07.pdf",
    pages: 32,
    updated: "2026-09-10T01:00:00.000Z",
    sample: true,
    starred: true,
    blocks: [
      {
        id: "demand",
        title: "Demand Paging",
        type: "text",
        source: "lecture",
        page: 17,
        priority: 3,
        html: "<p><strong>요구 페이징(Demand Paging)</strong>은 프로그램 실행에 필요한 페이지만 메모리에 적재하는 방식이다. 당장 사용하지 않는 페이지는 보조기억장치에 남겨 둔다.</p>",
        short: "요구 페이징은 필요한 페이지만 메모리에 올리는 방식이다.",
        easy: "프로그램 전체를 한 번에 가져오지 않고, 지금 필요한 부분만 메모리로 가져오는 방식이다.",
        example:
          "예를 들어 100페이지짜리 프로그램에서 3페이지만 사용한다면, 그 3페이지만 메모리에 올려서 실행한다.",
      },
      {
        id: "analogy",
        title: "",
        type: "callout",
        source: "ai",
        priority: 1,
        html: "<p><strong>책상과 책장을 떠올려 보세요.</strong><br>지금 읽는 책만 책상에 꺼내고, 나머지는 책장에 두는 것과 비슷해요. 필요한 순간에만 가져오면 책상을 더 넓게 쓸 수 있죠.</p>",
      },
      {
        id: "process",
        title: "페이지 폴트가 발생하면",
        type: "text",
        source: "external",
        page: 18,
        priority: 3,
        html: "<ol><li>참조한 페이지가 메모리에 없으면 <strong>페이지 폴트</strong>가 발생한다.</li><li>접근이 유효한지 확인하고, 디스크에서 필요한 페이지를 가져온다.</li><li>페이지 테이블을 갱신하고 <strong>중단된 명령을 다시 실행</strong>한다.</li></ol>",
        short:
          "페이지 폴트 → 유효한 접근 확인 → 페이지 적재 → 페이지 테이블 갱신 → 명령 재실행",
        easy: "필요한 페이지가 없다는 신호를 받으면, 운영체제가 디스크에서 페이지를 가져온 뒤 멈췄던 작업을 이어 간다.",
        example:
          "브라우저를 오래 쓰지 않다가 다시 열었을 때, 필요한 페이지를 디스크에서 가져오느라 잠시 느려질 수 있다.",
      },
      {
        id: "formula",
        title: "유효 접근 시간",
        type: "formula",
        source: "lecture",
        page: 21,
        priority: 2,
        html: "<p>페이지 폴트가 전체 메모리 접근 시간에 미치는 영향을 계산한다.</p>",
        formula: "EAT = (1 − p) × ma + p × fault time",
      },
      {
        id: "memo",
        title: "",
        type: "memo",
        source: "memo",
        priority: 1,
        html: "<p>교수님 강조: 페이지 폴트가 발생한 뒤, 중단된 명령부터 다시 실행한다는 점 기억하기.</p>",
      },
    ],
  },
  {
    id: "os-06",
    title: "메모리 관리의 기본",
    shortTitle: "06. 메모리 관리",
    subject: "운영체제",
    week: "06",
    file: "Lecture06.pdf",
    pages: 28,
    updated: "2026-09-09T05:00:00.000Z",
    sample: true,
    blocks: [
      {
        id: "paging",
        title: "페이징과 프레임",
        type: "text",
        source: "lecture",
        page: 12,
        priority: 3,
        html: "<p>논리 메모리는 고정 크기의 <strong>페이지</strong>로, 물리 메모리는 같은 크기의 <strong>프레임</strong>으로 나눈다.</p><ul><li>페이지 테이블은 페이지 번호를 프레임 번호에 연결한다.</li><li>페이지 내부의 위치인 오프셋은 주소 변환 후에도 같다.</li></ul>",
      },
    ],
  },
  {
    id: "algo-04",
    title: "동적 계획법과 메모이제이션",
    shortTitle: "04. 동적 계획법",
    subject: "알고리즘",
    week: "04",
    file: "Algorithm04.pdf",
    pages: 24,
    updated: "2026-09-08T03:00:00.000Z",
    sample: true,
    starred: true,
    blocks: [
      {
        id: "dp",
        title: "작은 문제부터 풀기",
        type: "text",
        source: "lecture",
        page: 8,
        priority: 3,
        html: "<p><strong>동적 계획법</strong>은 부분 문제의 답을 저장해 같은 계산을 반복하지 않는 방법이다.</p><ul><li>최적 부분 구조: 부분 문제의 최적해로 전체 최적해를 구성할 수 있다.</li><li>중복되는 부분 문제: 같은 작은 문제가 반복해서 등장한다.</li></ul>",
        short: "동적 계획법은 부분 문제의 답을 저장하고 재사용하는 방법이다.",
        example:
          "피보나치 수를 구할 때 이미 계산한 값을 저장하면 반복 계산을 줄일 수 있다.",
      },
      {
        id: "dp-memo",
        title: "",
        type: "memo",
        source: "memo",
        priority: 1,
        html: "<p>점화식을 먼저 세우고 초기값을 확인하기.</p>",
      },
    ],
  },
  {
    id: "math-03",
    title: "행렬과 선형 변환",
    shortTitle: "03. 선형 변환",
    subject: "선형대수",
    week: "03",
    file: "LinearAlgebra03.pdf",
    pages: 21,
    updated: "2026-09-07T05:00:00.000Z",
    sample: true,
    blocks: [
      {
        id: "matrix",
        title: "행렬을 변환으로 이해하기",
        type: "text",
        source: "lecture",
        page: 7,
        priority: 3,
        html: "<p>행렬은 벡터를 다른 벡터로 보내는 <strong>선형 변환</strong>을 표현할 수 있다. 변환 후에도 벡터의 덧셈과 스칼라 곱이 보존된다.</p>",
        easy: "행렬은 공간의 점을 일정한 규칙에 따라 이동시키는 도구다. 회전, 확대, 축소가 대표적인 예다.",
      },
    ],
  },
  {
    id: "algo-03",
    title: "분할 정복과 병합 정렬",
    shortTitle: "03. 분할 정복",
    subject: "알고리즘",
    week: "03",
    file: "Algorithm03.pdf",
    pages: 19,
    updated: "2026-09-06T05:00:00.000Z",
    sample: true,
    blocks: [
      {
        id: "merge",
        title: "나누고, 풀고, 합치기",
        type: "text",
        source: "lecture",
        page: 6,
        priority: 2,
        html: "<p>병합 정렬은 배열을 절반씩 나누고, 정렬된 부분 배열을 합치는 과정을 반복한다.</p><ul><li>시간 복잡도: O(n log n)</li><li>일반적인 배열 구현의 추가 공간: O(n)</li></ul>",
      },
    ],
  },
];
const originalSamples = structuredClone(seedNotes);
enrichSamples(seedNotes);
// Keep the existing storage key so previously written notes are preserved.
const KEY = "gyeol.workspace.v1";
function readState() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (
      v?.version === 1 &&
      Array.isArray(v.notes) &&
      v.notes.every(
        (n) =>
          typeof n.id === "string" &&
          typeof n.subject === "string" &&
          Array.isArray(n.blocks),
      )
    ) {
      v.history = Array.isArray(v.history) ? v.history : [];
      v.dna =
        v.dna && typeof v.dna === "object"
          ? v.dna
          : { 기본: structuredClone(defaultDNA) };
      return v;
    }
  } catch (e) {}
  return {
    version: 1,
    notes: structuredClone(seedNotes),
    dna: { 기본: structuredClone(defaultDNA) },
    history: [],
  };
}
let data = readState();
initializeScopedSettings();
upgradeSavedSamples(data.notes, originalSamples, seedNotes);
data.recommendationDecisions ||= {};
for (const n of data.notes)
  n.classNotes = Array.isArray(n.classNotes) ? n.classNotes : [];
let ui = {
  view: data.basicDNAReady === false ? "dna" : "editor",
  noteId: "os-07",
  selected: null,
  exam: false,
  sourceOpen: false,
  page: 17,
  filter: "전체",
  query: "",
  dnaSubject: "운영체제",
  draft: null,
  expanded: "운영체제",
  pending: null,
  upload: null,
};
if (!data.notes.some((n) => n.id === ui.noteId)) ui.noteId = data.notes[0]?.id;
let saveTimer,
  toastTimer,
  dragId,
  undoStack = [],
  storageFailed = false;
function sanitize(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html);
  const allowed = new Set([
    "P",
    "BR",
    "STRONG",
    "EM",
    "B",
    "I",
    "U",
    "UL",
    "OL",
    "LI",
    "TABLE",
    "THEAD",
    "TBODY",
    "TR",
    "TD",
    "TH",
    "SUB",
    "SUP",
    "DIV",
    "SPAN",
  ]);
  function walk(parent) {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === 1) {
        if (["SCRIPT", "STYLE", "IFRAME", "OBJECT"].includes(node.tagName)) {
          node.remove();
          continue;
        }
        walk(node);
        if (!allowed.has(node.tagName)) {
          node.replaceWith(...node.childNodes);
          continue;
        }
        for (const a of [...node.attributes]) node.removeAttribute(a.name);
      }
    }
  }
  const fragment = template.content;
  walk(fragment);
  const result = document.createElement("div");
  result.appendChild(fragment.cloneNode(true));
  return result.innerHTML;
}
function plain(html) {
  const t = document.createElement("div");
  t.innerHTML = html;
  return t.textContent || "";
}
for (const n of data.notes) {
  n.blocks.forEach((b) => (b.html = sanitize(b.html)));
}
function note() {
  return data.notes.find((n) => n.id === ui.noteId);
}
function dna(subject = note()?.subject || ui.dnaSubject) {
  return {
    ...defaultDNA,
    ...deriveDNA(personalForSubject(subject), subjectSettings(subject)),
  };
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    storageFailed = false;
    $(".save-status") &&
      ($(".save-status").innerHTML = icon("check") + "이 기기에 저장됨");
    return true;
  } catch (e) {
    storageFailed = true;
    $(".save-status") && ($(".save-status").textContent = "저장 공간 부족");
    toast("저장 공간이 부족해요. 노트를 내보내 주세요.");
    return false;
  }
}
function changed() {
  if (note()) note().updated = new Date().toISOString();
  $(".save-status") && ($(".save-status").textContent = "저장 중…");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 350);
}
function snapshot() {
  undoStack.push(JSON.stringify(data));
  if (undoStack.length > 30) undoStack.shift();
}
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3000);
}
function btn(label, action, cls = "", attrs = "") {
  return `<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
}
function subjectClass(s) {
  return s === "알고리즘" ? "blue" : s === "선형대수" ? "purple" : "";
}
function toolbar(block) {
  return `<div class="context-toolbar" aria-label="선택한 블록 편집">${block.type !== "memo" ? `${btn(icon("pen") + "다듬기" + icon("down"), "refine-menu")}${btn(icon("layout") + "형태" + icon("down"), "format-menu")}<span class="toolbar-divider"></span>${btn(icon("link") + "근거", "evidence")}` : ""}${btn(icon("more"), "block-menu", "", 'aria-label="블록 관리 메뉴"')}</div>`;
}
function sidebar() {
  const subjects = [
    ...new Set([
      "운영체제",
      "알고리즘",
      "선형대수",
      ...data.notes.map((n) => n.subject),
    ]),
  ];
  return `<aside class="sidebar" aria-label="주요 메뉴">${btn('<span class="brand-logo">' + icon("dna") + '</span><span class="brand-name">Note DNA</span>', "home", "brand")}<div class="workspace-picker"><span class="avatar">나</span>나의 노트 공간${icon("lock")}</div><nav>${btn(icon("book") + "내 노트", "home", "nav-item " + (["home", "editor"].includes(ui.view) ? "active" : ""))}${btn(icon("dna") + "정리 스타일", "dna", "nav-item " + (ui.view === "dna" ? "active" : ""))}${btn(icon("grid") + "템플릿", "templates", "nav-item " + (ui.view === "templates" ? "active" : ""))}</nav><div class="section-label">이번 학기${btn(icon("plus"), "upload", "icon-button", 'aria-label="새 노트 만들기"')}</div><div class="course-list">${subjects
    .map((s) => {
      const ns = data.notes.filter((n) => n.subject === s);
      return `${btn(icon(ui.expanded === s ? "down" : "right") + `<span class="course-dot ${subjectClass(s)}"></span>${esc(s)}<span class="count">${ns.length}</span>`, "course", "course-button", `data-subject="${esc(s)}" aria-expanded="${ui.expanded === s}"`)}${ui.expanded === s ? ns.map((n) => btn(icon("file") + `<span>${esc(n.shortTitle || n.title)}</span>`, "open-note", "note-link " + (ui.noteId === n.id && ui.view === "editor" ? "current" : ""), `data-id="${esc(n.id)}"`)).join("") : ""}`;
    })
    .join(
      "",
    )}</div><div class="sidebar-bottom"><div class="sidebar-hint">배운 것을,<br>나의 언어로 쌓아가는 곳.</div><div class="local-status">${icon("lock")}이 브라우저에만 저장돼요</div></div></aside>`;
}
function header() {
  let n = note();
  return `<header class="topbar">${btn(icon("menu"), "mobile", "icon-button mobile-toggle", 'aria-label="메뉴 열기"')}<div class="breadcrumbs">${icon("book")}<span>내 노트</span><span>/</span>${ui.view === "editor" ? `<span>${esc(n?.subject || "")}</span><span>/</span><strong>${esc(n?.shortTitle || n?.title || "새 노트")}</strong>` : `<strong>${ui.view === "home" ? "모든 노트" : ui.view === "dna" ? "Note DNA" : "템플릿"}</strong>`}</div><div class="top-actions">${ui.view === "editor" ? `<span class="save-status">${icon("check")}${storageFailed ? "저장 공간 부족" : "이 기기에 저장됨"}</span>${btn(icon("star"), "favorite", "icon-button", `aria-label="즐겨찾기 ${n?.starred ? "해제" : "추가"}" aria-pressed="${!!n?.starred}" style="${n?.starred ? "color:#b39f70" : ""}"`)}${btn(icon("more"), "document-menu", "icon-button", 'aria-label="노트 메뉴"')}${btn(icon("download") + "내보내기", "export-menu", "btn secondary")}` : '<span class="preview-badge">UI 미리보기</span>'}</div></header>`;
}
function blockHTML(b, index) {
  const src =
    b.source === "class-notes"
      ? ["pen", "수업 필기 · " + esc(b.sourceName || "첨부 필기"), "memo"]
      : b.source === "memo"
        ? ["pen", "내 메모", "memo"]
        : b.source === "ai"
          ? ["light", "보충 설명", "ai"]
          : b.source === "external"
            ? ["globe", "외부 보충", "external"]
            : ["file", `강의자료 · p.${b.page || 1}`, ""];
  const source = btn(
    icon(src[0]) + src[1],
    b.source === "memo" ? "memo-info" : "block-source",
    "source-label " + src[2],
    `data-block="${b.id}"`,
  );
  const titleMarkup = b.title
    ? `<div class="block-title"><span class="section-number">${String(index).padStart(2, "0")}</span><h2>${esc(b.title)}</h2></div>`
    : "";
  return `<section class="note-block ${b.optional ? "supplementary-block" : ""} ${ui.selected === b.id ? "selected" : ""}" data-block="${esc(b.id)}" id="block-${esc(b.id)}" tabindex="0" aria-label="${esc(b.title || src[1])} 블록">${btn(icon("grip"), "select-block", "block-handle", `draggable="true" data-block="${esc(b.id)}" aria-label="블록 이동 및 편집"`)}${b.optional ? `<details class="supplementary"><summary>${titleMarkup}<span class="expand-hint">펼쳐보기</span></summary><div class="supplementary-content">` : titleMarkup}${source}${ui.exam ? `<div class="priority">${"★".repeat(b.priority || 1)} ${b.priority === 3 ? "반드시 기억하기" : "중요 개념"}</div>` : ""}<div class="${b.type === "callout" ? "explain-callout" : b.type === "memo" ? "memo-body" : ""}">${b.type === "callout" ? icon("light") : ""}<div class="block-content" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${esc(b.title || src[1])} 내용" spellcheck="false">${sanitize(b.html)}</div></div>${b.type === "formula" ? `<div class="formula">${esc(b.formula || "")}</div><div class="formula-foot"><span>p: 페이지 폴트 확률 · ma: 메모리 접근 시간</span>${btn("수식 이해하기" + icon("down"), "formula-menu", "", 'data-block="' + b.id + '"')}</div>` : ""}${b.optional ? "</div></details>" : ""}${ui.selected === b.id ? toolbar(b) : ""}</section>`;
}
function sourcePanel() {
  const n = note();
  const title =
    n.subject === "알고리즘"
      ? n.title.includes("병합")
        ? "Merge Sort"
        : "Dynamic Programming"
      : n.subject === "선형대수"
        ? "Linear Transformation"
        : n.id === "os-06"
          ? "Paging and Frames"
          : ui.page >= 21
            ? "Effective Access Time"
            : ui.page >= 18
              ? "Page Fault Handling"
              : "Demand Paging";
  return `<section class="source-panel"><div class="source-panel-header"><div><strong>${esc(n.file || "연결된 자료")}</strong><small> · ${n.pages || 1}페이지</small></div>${btn(icon("close"), "source-toggle", "icon-button", 'aria-label="원본 자료 닫기"')}</div><div class="slide-canvas"><small>${esc(n.subject)} · SAMPLE MATERIAL</small><h2>${title}</h2><ul>${n.subject !== "운영체제" || n.id === "os-06" ? "<li>" + esc(n.blocks[0]?.title || n.title) + "</li><li>" + esc(plain(n.blocks[0]?.html || "").slice(0, 190)) + "</li>" : ui.page >= 21 ? "<li>Page fault rate: p</li><li>Memory access time: ma</li><li>Effective access time</li>" : ui.page >= 18 ? "<li>Check valid reference</li><li>Bring page into memory</li><li>Restart instruction</li>" : "<li>Page fault</li><li>Lazy swapping</li><li>Valid–invalid bit</li>"}</ul></div><p class="source-preview-label">편집 흐름을 보여주는 샘플 강의자료입니다.</p><div class="slide-nav">${btn(icon("left"), "page-prev", "icon-button", `aria-label="이전 페이지" ${ui.page <= 1 ? "disabled" : ""}`)}<span>${ui.page} / ${n.pages || 1}</span>${btn(icon("right"), "page-next", "icon-button", `aria-label="다음 페이지" ${ui.page >= (n.pages || 1) ? "disabled" : ""}`)}</div></section>`;
}
function editor() {
  const n = note();
  if (!n) return home();
  let number = 0;
  const blocks = n.blocks.filter((b) => !ui.exam || b.priority >= 2);
  const d = dna();
  return `<div class="editor-wrap"><section class="document-header"><div class="document-icon">${icon("book")}</div><div class="document-eyebrow">${esc(n.subject)}<span>·</span>${n.week ? `WEEK ${esc(n.week)}` : "MY NOTE"}</div><h1 contenteditable="true" role="textbox" aria-label="노트 제목" id="note-title" spellcheck="false">${esc(n.title)}</h1><div class="document-meta">${btn(icon("file") + esc(n.file || "직접 작성한 노트"), "source-toggle")}<span>${n.pages ? `${n.pages}페이지 · ` : ""}${n.sample ? "예시 노트" : "내 노트"}</span><span>${icon("clock")} ${dateLabel(n.updated)} 편집</span></div></section><div class="document-bar"><div class="view-tabs" aria-label="노트 보기 방식">${btn(icon("book") + "학습 노트", "study", "view-tab " + (!ui.exam ? "active" : ""), `aria-pressed="${!ui.exam}"`)}${btn(icon("star") + "시험 모드", "exam", "view-tab " + (ui.exam ? "active" : ""), `aria-pressed="${ui.exam}"`)}</div><div class="bar-right"><span class="bar-caption">읽고, 나에게 맞게 다듬어 보세요</span>${btn(icon("panel") + "원본 함께 보기", "source-toggle", "split-button " + (ui.sourceOpen ? "active" : ""), `aria-pressed="${ui.sourceOpen}"`)}</div></div>${noteSettingsEntry(n)}${classNotesBar(n)}<div class="editor-layout"><article class="note-canvas" aria-label="노트 편집기">${ui.sourceOpen ? sourcePanel() : ""}${ui.exam ? `<div class="exam-banner">${icon("star")}중요도 2개 이상의 개념만 모았어요. 메모와 원래 내용은 보존됩니다.</div>` : `<p class="note-intro">${n.id === "os-07" ? "필요한 것만 메모리에 올리고, 한정된 공간을 효율적으로 사용하는 방법." : n.sample ? "핵심을 이해하고, 나만의 설명을 덧붙여 보세요." : "내용을 눌러 작성하세요. 변경 사항은 이 기기에 저장됩니다."}</p>`}${!ui.exam ? overviewHTML(n) : ""}${blocks.length ? blocks.map((b) => blockHTML(b, b.title ? ++number : number)).join("") : `<div class="empty-state">${icon("book")}<p>${ui.exam ? "중요 표시한 개념이 아직 없어요." : "첫 문장을 기록해 보세요."}</p></div>`}${!ui.exam ? btn(icon("plus") + "내 메모 추가", "add-memo", "add-block") : ""}<div class="editor-foot">${icon("grip")}블록을 선택하면 다듬기 메뉴가 나타나요. 손잡이로 순서를 바꿀 수 있어요.</div></article><aside class="document-aside" aria-label="노트 목차와 설정"><h2 class="aside-label">이 노트의 목차</h2><nav class="outline">${blocks
    .filter((b) => b.title)
    .map((b, i) =>
      btn(
        esc(b.title),
        "outline",
        i === 0 ? "active" : "",
        `data-id="${esc(b.id)}"`,
      ),
    )
    .join(
      "",
    )}</nav><div class="rail-style">${icon("dna")}<div><strong>나의 정리 스타일</strong><small>${["간단한 분량", "적당한 분량", "자세한 분량"][d.density - 1]} · ${esc(d.formats[0] || "자유 형식")}</small></div>${btn(icon("right"), "dna", "icon-button", 'aria-label="정리 스타일 설정"')}</div></aside></div></div>`;
}
function dateLabel(value) {
  const d = new Date(value);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function render() {
  closePopover();
  document.title =
    (ui.view === "editor"
      ? note()?.title
      : ui.view === "dna"
        ? "Note DNA"
        : ui.view === "templates"
          ? "템플릿"
          : "내 노트") + " — Note DNA";
  $("#app").innerHTML =
    `<div class="app-shell">${sidebar()}<div class="mobile-shade" data-action="mobile-close"></div><main class="workspace" id="main">${header()}${ui.view === "editor" ? editor() : ui.view === "dna" ? dnaPage() : ui.view === "templates" ? templatesPage() : home()}</main></div>`;
}
function closePopover() {
  $("#popover").hidden = true;
}
function navigate(view) {
  if (ui.view === "dna" && ui.draft) {
    commitScopedDraft();
  }
  save();
  ui.view = view;
  ui.selected = null;
  ui.sourceOpen = false;
  if (view === "dna") {
    ui.dnaSubject = note()?.subject || "기본";
    ui.draft = structuredClone(dna(ui.dnaSubject));
  }
  document.body.classList.remove("focus-mode");
  render();
  window.scrollTo(0, 0);
}
function openNote(id) {
  if (!data.notes.some((n) => n.id === id)) return;
  if (ui.view === "dna" && ui.draft) {
    commitScopedDraft();
  }
  save();
  ui.noteId = id;
  ui.expanded = note().subject;
  ui.view = "editor";
  ui.selected = null;
  ui.exam = false;
  ui.sourceOpen = false;
  ui.page = note().blocks.find((b) => b.page)?.page || 1;
  render();
  window.scrollTo(0, 0);
}
render();
function noteRows() {
  const list = data.notes
    .filter(
      (n) =>
        (ui.filter === "전체" ||
          (ui.filter === "즐겨찾기" && n.starred) ||
          n.subject === ui.filter) &&
        (!ui.query ||
          `${n.title} ${n.subject} ${n.blocks.map((b) => plain(b.html)).join(" ")}`
            .toLowerCase()
            .includes(ui.query.toLowerCase())),
    )
    .sort((a, b) => new Date(b.updated) - new Date(a.updated));
  return list.length
    ? list
        .map(
          (n) =>
            `<tr><td class="note-row-title">${btn(icon("file") + esc(n.title), "open-note", "", `data-id="${esc(n.id)}"`)}</td><td><span class="subject-tag ${subjectClass(n.subject)}">${esc(n.subject)}</span></td><td>${n.sample ? "예시 노트" : "내 노트"}</td><td>${dateLabel(n.updated)}</td><td>${btn(icon("more"), "row-menu", "icon-button", `data-id="${esc(n.id)}" aria-label="${esc(n.title)} 관리"`)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="5"><div class="empty-state">${icon("search")}<h3>찾는 노트가 없어요</h3><p>다른 검색어를 입력하거나 새 노트를 만들어 보세요.</p></div></td></tr>`;
}
function home() {
  return `<section class="page"><header class="page-header"><div><h1>내 노트</h1><p>한 번 배운 것을, 오래 남는 지식으로.</p></div>${btn(icon("plus") + "새 노트", "upload", "btn primary")}</header><div class="page-section-head"><h2>이어서 정리하기</h2><span class="muted" style="font-size:11px">최근 편집한 노트</span></div><div class="recent-grid">${[
    ...data.notes,
  ]
    .sort((a, b) => new Date(b.updated) - new Date(a.updated))
    .slice(0, 3)
    .map((n) =>
      btn(
        `<span class="recent-icon">${icon("book")}</span><strong>${esc(n.title)}</strong><small>${esc(n.subject)} · ${dateLabel(n.updated)}</small>`,
        "open-note",
        "recent-card",
        `data-id="${esc(n.id)}"`,
      ),
    )
    .join(
      "",
    )}</div><div class="note-list-tools"><div class="filter-tabs" aria-label="노트 필터">${["전체", "즐겨찾기", "운영체제", "알고리즘", "선형대수"].map((s) => btn(esc(s), "filter", "filter-tab " + (ui.filter === s ? "active" : ""), `data-filter="${s}" aria-pressed="${ui.filter === s}"`)).join("")}</div><label class="search-box">${icon("search")}<input type="search" id="note-search" placeholder="노트 검색" aria-label="노트 검색" value="${esc(ui.query)}"></label></div><table class="notes-table"><thead><tr><th scope="col">노트 이름</th><th scope="col">과목</th><th scope="col">구분</th><th scope="col">최근 수정</th><th scope="col"><span aria-label="관리"></span></th></tr></thead><tbody id="note-rows">${noteRows()}</tbody></table><p class="template-footnote">${data.notes.length}개의 노트 · 작성한 내용은 이 브라우저에 저장됩니다. ${btn("실행 취소", "undo", "btn ghost")}</p></section>`;
}
const densityLabels = ["핵심만", "적당히", "자세하게"];
function dnaPage() {
  return scopedSettingsPage();
}
function learningSummary(history) {
  const shorter = history.filter((h) => h.before > h.after && h.before > 0);
  if (shorter.length) {
    const percent = Math.round(
      (shorter.reduce((s, h) => s + (1 - h.after / h.before), 0) /
        shorter.length) *
        100,
    );
    return `설명을 줄인 ${shorter.length}번의 편집에서 평균 ${percent}% 짧아졌어요.`;
  }
  return "내가 적용한 형식과 설명량을 기록하고 있어요.";
}
function dnaPreview(d) {
  let text = [
    "빈 프레임이 없으면 기존 페이지를 교체한다.",
    "페이지 교체는 빈 프레임이 없을 때 기존 페이지를 내보내고 필요한 페이지를 적재하는 과정이다.",
    "페이지 교체는 물리 메모리의 빈 프레임이 부족할 때 기존 페이지 하나를 선택해 내보낸 뒤, 필요한 페이지를 적재하는 과정이다. 변경된 페이지는 디스크에 기록해야 하므로 교체 알고리즘의 선택이 성능에 영향을 준다.",
  ][d.density - 1];
  if (d.bold)
    text = text.replace("페이지 교체", "<strong>페이지 교체</strong>");
  let formats = d.formats.includes("표")
    ? "<table><tr><td>FIFO</td><td>먼저 들어온 순서</td></tr><tr><td>LRU</td><td>오래 사용하지 않은 순서</td></tr></table>"
    : d.formats.includes("글머리표")
      ? "<ul><li>FIFO: 먼저 들어온 페이지 교체</li><li>LRU: 오래 사용하지 않은 페이지 교체</li></ul>"
      : d.formats.includes("흐름도")
        ? "<p>빈 프레임 확인 → 페이지 선택 → 교체</p>"
        : "<p>FIFO는 먼저 들어온 페이지를, LRU는 가장 오래 사용하지 않은 페이지를 교체한다.</p>";
  return `${d.pages ? '<span class="source-label">강의자료 · p.24</span>' : ""}<div class="preview-body"><p>${text}</p>${formats}${d.difficulty === "예시까지" ? "<p>예: A, B, C 순서로 들어왔다면 FIFO는 A를 먼저 교체한다.</p>" : d.difficulty === "쉽게 풀어서" ? "<p>새 책을 놓을 자리가 없으면, 책상 위의 다른 책을 먼저 치우는 것과 같다.</p>" : ""}${d.star ? "<p>★ FIFO와 LRU의 교체 기준을 구분하기</p>" : ""}${d.formula !== "수식만" ? `<p>${d.formula === "자세한 풀이" ? "폴트 비율 = 폴트 횟수 ÷ 전체 접근 횟수. 예를 들어 10번 접근해 2번 폴트가 발생하면 2 ÷ 10 = 20%." : "폴트 비율 = 폴트 횟수 ÷ 전체 접근 횟수"}</p>` : ""}</div>${classDNAPreview(d)}<p class="preview-note">선택한 설명량과 형식이 바로 반영됩니다.<br>추가 요청·외부 자료 보강은 AI 연결 후 적용됩니다.</p>`;
}
function refreshDNAPreview() {
  refreshScopedPreview();
}
const templates = [
  {
    id: "compact",
    name: "핵심부터, 간결하게",
    subject: "전공 · 시험 정리",
    description:
      "짧은 정의와 글머리표 중심으로.<br>중요 개념은 한눈에 들어오게.",
    density: 1,
    formats: ["글머리표"],
    difficulty: "원문 유지",
    formula: "수식 + 설명",
  },
  {
    id: "math",
    name: "수식의 맥락까지",
    subject: "수학 · 공학",
    description:
      "기호의 의미부터 풀이 과정까지.<br>개념과 계산을 함께 이해해요.",
    density: 3,
    formats: ["표", "글머리표"],
    difficulty: "예시까지",
    formula: "자세한 풀이",
    color: "blue",
  },
  {
    id: "context",
    name: "이해하며 읽는 노트",
    subject: "교양 · 인문",
    description: "연결되는 개념은 문장으로,<br>서로 다른 관점은 비교표로.",
    density: 2,
    formats: ["긴 문단", "표"],
    difficulty: "쉽게 풀어서",
    formula: "수식만",
    color: "purple",
  },
];
function templatesPage() {
  return `<section class="page"><header class="page-header"><div><h1>정리의 시작점</h1><p>마음에 드는 방식을 고르고, 내 스타일을 조금 더하세요.</p></div>${btn(icon("download") + "내 DNA 내보내기", "export-dna", "btn secondary")}</header><div class="page-section-head"><h2>기본 템플릿</h2><span class="muted" style="font-size:11px">나에게 맞게 조합할 수 있어요</span></div><div class="template-grid">${templates.map((t, i) => `<article class="template-card"><div class="template-sample ${t.color || ""}"><h3>${i === 0 ? "01. 핵심 개념" : i === 1 ? "수식과 풀이 과정" : "개념을 연결하며"}</h3>${i === 1 ? '<div class="sample-formula">Ax = λx</div>' : '<div class="sample-rule"></div><div class="sample-rule short"></div>'}<div class="sample-rule"></div><div class="sample-rule short"></div></div><div class="template-info"><span class="source-label">${t.subject}</span><h2>${t.name}</h2><p>${t.description}</p>${btn("미리보기 및 적용" + icon("arrow"), "template-preview", "btn secondary", `data-id="${t.id}"`)}</div></article>`).join("")}</div><p class="template-footnote">기본 제공 예시 템플릿입니다. 내 Note DNA는 파일로 내보내 공유할 수 있어요.</p></section>`;
}
function showModal(title, body, footer = "", subtitle = "", eyebrow = "") {
  closePopover();
  const m = $("#modal");
  m.innerHTML = `<div class="modal-body"><header class="modal-header"><div>${eyebrow ? `<span class="modal-eyebrow">${eyebrow}</span>` : ""}<h2 id="modal-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div>${btn(icon("close"), "close-modal", "icon-button", 'aria-label="닫기"')}</header>${body}${footer ? `<footer class="modal-footer">${footer}</footer>` : ""}</div>`;
  if (!m.open) m.showModal();
}
function closeModal() {
  $("#modal").close();
  ui.pending = null;
  ui.classPlan = null;
  ui.classToken = null;
}
function popover(anchor, html) {
  const p = $("#popover");
  p.innerHTML = html;
  p.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = p.offsetWidth;
  const h = p.offsetHeight;
  p.style.left = Math.max(9, Math.min(r.left, innerWidth - w - 9)) + "px";
  p.style.top =
    Math.max(9, r.bottom + h + 8 < innerHeight ? r.bottom + 7 : r.top - h - 7) +
    "px";
  const first = $("button,input", p);
  first?.focus();
}
function item(label, action, name = "text", attrs = "") {
  return btn(icon(name) + label, action, "", attrs);
}
function uploadModal() {
  ui.upload = null;
  ui.newNoteSettings = structuredClone(noteDefaults);
  ui.newSubjectDraft = structuredClone(subjectDefaults);
  ui.newLearningDraft = structuredClone(learningDefaults);
  showModal(
    "새 노트 시작하기",
    `<label class="drop-zone" id="drop-zone" tabindex="0">${icon("upload")}<strong>강의자료를 놓거나 눌러서 선택하세요</strong><small>PDF, PPT, Word, Markdown, 텍스트, 이미지 · 최대 25MB</small><input type="file" id="material-file" accept=".pdf,.ppt,.pptx,.doc,.docx,.md,.txt,.png,.jpg,.jpeg,.webp" hidden></label><div id="picked-file"></div><div class="form-field"><label for="upload-title">노트 제목</label><input id="upload-title" placeholder="어떤 내용을 정리할까요?" maxlength="150"></div><div class="form-field"><label for="upload-subject">과목</label><select id="upload-subject">${[...new Set(["운영체제", "알고리즘", "선형대수", ...data.notes.map((n) => n.subject)])].map((s) => `<option ${s === note()?.subject ? "selected" : ""}>${esc(s)}</option>`).join("")}<option value="__new">새 과목 만들기</option></select><input id="new-subject" placeholder="새 과목 이름" maxlength="40" hidden></div><div id="new-subject-dna" hidden>${advancedSettings("새 과목의 DNA 설정", subjectFields(ui.newSubjectDraft, "new-subject"), "new-course-panels")}${advancedSettings("새 과목의 학습 DNA", learningFields(ui.newLearningDraft, "new-learning"), "new-course-panels")}</div><div class="new-note-settings"><h3>적용할 DNA</h3><div id="new-note-options">${noteFields(ui.newNoteSettings, null, true)}</div></div><p class="upload-note">파일은 이 기기에 보관됩니다. 텍스트는 바로 가져오며, PDF·PPT 분석과 웹 검색은 AI 연결 후 사용할 수 있어요.</p><p id="upload-error" class="form-error" role="alert"></p>`,
    btn("예시로 체험하기", "sample-note", "btn ghost") +
      btn("노트 만들기", "create-note", "btn primary"),
    "자료를 가져오거나 빈 노트에서 직접 기록하세요.",
  );
}
function selectFile(file) {
  const error = $("#upload-error");
  if (!file) return;
  const ext = file.name.split(".").pop().toLowerCase();
  if (
    ![
      "pdf",
      "ppt",
      "pptx",
      "doc",
      "docx",
      "md",
      "txt",
      "png",
      "jpg",
      "jpeg",
      "webp",
    ].includes(ext)
  ) {
    error.textContent = "지원하지 않는 파일 형식이에요.";
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    error.textContent = "25MB 이하의 파일을 선택해 주세요.";
    return;
  }
  ui.upload = file;
  error.textContent = "";
  $("#picked-file").innerHTML =
    `<div class="file-picked">${icon("file")}<div><strong>${esc(file.name)}</strong><small>${(file.size / 1024 / 1024).toFixed(2)} MB · 이 기기에 보관</small></div>${btn(icon("close"), "clear-file", "icon-button", 'aria-label="선택한 파일 제거"')}</div>`;
  $("#upload-title").value = file.name.replace(/\.[^.]+$/, "");
  refreshNewNoteSources();
}
function fileDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB)
      return reject(new Error("파일 보관을 지원하지 않는 브라우저입니다."));
    const request = indexedDB.open("gyeol-files", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function storeFile(id, file) {
  const db = await fileDatabase();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(file, id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
async function getFile(id) {
  const db = await fileDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction("files").objectStore("files").get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}
function markdownToHTML(text) {
  return text
    .split(/\n{2,}/)
    .map((chunk) => {
      let value = esc(chunk.trim());
      if (!value) return "";
      if (/^#{1,6} /.test(value))
        return "<p><strong>" + value.replace(/^#{1,6} /, "") + "</strong></p>";
      if (/^[-*] /m.test(value))
        return (
          "<ul>" +
          value
            .split("\n")
            .map((v) => "<li>" + v.replace(/^[-*] /, "") + "</li>")
            .join("") +
          "</ul>"
        );
      return "<p>" + value.replace(/\n/g, "<br>") + "</p>";
    })
    .join("");
}
async function createNote() {
  const title = $("#upload-title").value.trim();
  let subject = $("#upload-subject").value;
  const error = $("#upload-error");
  if (subject === "__new") subject = $("#new-subject").value.trim();
  if (!title) {
    error.textContent = "노트 제목을 입력해 주세요.";
    $("#upload-title").focus();
    return;
  }
  if (!subject) {
    error.textContent = "과목 이름을 입력해 주세요.";
    $("#new-subject").focus();
    return;
  }
  if (
    ui.newNoteSettings?.scopeMode === "단원·페이지 선택" &&
    !ui.newNoteSettings.pageRange.trim()
  ) {
    error.textContent = "정리할 단원이나 페이지를 입력해 주세요.";
    return;
  }
  if (
    ui.newNoteSettings?.scopeMode === "시험 범위 직접 입력" &&
    !ui.newNoteSettings.examRange.trim()
  ) {
    error.textContent = "이번 시험 범위를 입력해 주세요.";
    return;
  }
  if (
    ui.newNoteSettings?.sourceMode === "selected" &&
    !ui.newNoteSettings.sourceIds.length
  ) {
    error.textContent =
      "이번 노트 설정에서 사용할 자료를 하나 이상 선택해 주세요.";
    return;
  }
  const submit = $('[data-action="create-note"]');
  submit.disabled = true;
  submit.textContent = "가져오는 중…";
  const file = ui.upload;
  const id = uid();
  try {
    let html = "<p>여기에 첫 메모를 작성해 보세요.</p>";
    if (file) {
      await storeFile(id, file);
      if (/\.(md|txt)$/i.test(file.name)) {
        const text = await file.text();
        if (text.length > 400000)
          throw new Error("텍스트는 40만 자 이하로 나누어 가져와 주세요.");
        html = markdownToHTML(text);
      }
    }
    snapshot();
    const n = {
      id,
      title,
      subject,
      week: "",
      file: file?.name || "",
      fileKey: file ? id : null,
      pages: 0,
      sample: false,
      updated: new Date().toISOString(),
      research: dna(subject).research,
      runSettings: structuredClone(ui.newNoteSettings || noteDefaults),
      blocks: [
        {
          id: uid(),
          title:
            file && /\.(md|txt)$/i.test(file.name) ? "가져온 내용" : "내 메모",
          type: "memo",
          source: "memo",
          priority: 1,
          html,
        },
      ],
    };
    if ($("#upload-subject").value === "__new") {
      data.subjectDNA ||= {};
      data.subjectDNA[subject] = structuredClone(ui.newSubjectDraft);
      data.learningDNA ||= {};
      data.learningDNA[subject] = structuredClone(ui.newLearningDraft);
    }
    data.notes.unshift(n);
    save();
    closeModal();
    openNote(id);
    toast(
      file ? "자료와 새 노트를 이 기기에 저장했어요." : "새 노트를 만들었어요.",
    );
  } catch (e) {
    error.textContent =
      e.message || "파일을 저장하지 못했어요. 다시 선택해 주세요.";
    submit.disabled = false;
    submit.textContent = "노트 만들기";
  }
}
let sourceObjectURL = null;
async function showActualSource(source = note()) {
  const n = source;
  if (!n?.fileKey) {
    toast("연결된 파일이 없어요. 새 노트에서 자료를 가져올 수 있어요.");
    return;
  }
  try {
    const file = await getFile(n.fileKey);
    if (!file) {
      toast("이 브라우저에서 원본 파일을 찾을 수 없어요.");
      return;
    }
    if (sourceObjectURL) URL.revokeObjectURL(sourceObjectURL);
    sourceObjectURL = URL.createObjectURL(file);
    let content;
    if (/\.pdf$/i.test(file.name))
      content = `<object data="${sourceObjectURL}#page=${ui.page}" type="application/pdf" style="width:100%;height:60vh"><p>브라우저에서 PDF 미리보기를 지원하지 않아요.</p></object>`;
    else if (/\.(png|jpg|jpeg|webp)$/i.test(file.name))
      content = `<img src="${sourceObjectURL}" alt="${esc(file.name)}" style="display:block;max-width:100%;max-height:60vh;margin:auto">`;
    else if (/\.(txt|md)$/i.test(file.name))
      content = `<div style="max-height:55vh;overflow:auto;white-space:pre-wrap;font-size:13px">${esc(await file.text())}</div>`;
    else
      content =
        '<div class="empty-state">' +
        icon("file") +
        "<p>이 형식은 원본 파일을 내려받아 열어 주세요.</p></div>";
    showModal(
      esc(file.name),
      content,
      `<a class="btn secondary" href="${sourceObjectURL}" download="${esc(file.name)}">원본 내려받기</a>`,
      "이 기기에 저장된 원본 자료",
    );
  } catch (e) {
    toast("원본 자료를 열 수 없어요. 브라우저 저장 권한을 확인해 주세요.");
  }
}
function evidence() {
  const b = note()?.blocks.find((b) => b.id === ui.selected);
  if (!b) return;
  if (b.source === "class-notes") {
    classSourceModal(b);
    return;
  }
  if (b.source === "memo") {
    toast("직접 작성한 메모입니다.");
    return;
  }
  const isExternal = b.source === "external";
  showModal(
    "내용의 근거",
    `<div class="source-label ${isExternal ? "external" : ""}">${icon(isExternal ? "globe" : "file")}${isExternal ? "외부 참고자료" : b.source === "ai" ? "개념 이해를 위한 보충 설명" : "강의자료"}</div><div class="compare-content">${sanitize(b.html)}</div><hr class="aside-divider">${isExternal ? '<p class="upload-note">이 예시 노트의 읽기 자료입니다. 자동 검색으로 검증된 인용은 아닙니다.</p><a class="btn secondary" href="https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf" target="_blank" rel="noopener noreferrer">OSTEP · Beyond Physical Memory: Mechanisms ↗</a>' : b.source === "ai" ? '<p class="upload-note">개념 이해를 돕기 위해 준비한 예시 설명입니다. 강의자료 원문의 표현과 구분됩니다.</p>' : `<p class="upload-note">${esc(note().file)} · ${b.page || 1}페이지${note().sample ? " · 샘플 자료" : ""}</p>`}`,
    btn("닫기", "close-modal", "btn secondary") +
      btn("원본 함께 보기", "evidence-original", "btn primary"),
    "강의자료, 외부 설명, 내 메모의 출처를 구분해요.",
  );
}
function stageEdit(kind) {
  const b = note().blocks.find((b) => b.id === ui.selected);
  if (!b || b.type === "memo") {
    toast("내 메모는 직접 수정해 주세요.");
    return;
  }
  let html;
  const text = plain(b.html);
  const sentences = text.split(/(?<=[.!?。])\s+|\n/).filter(Boolean);
  if (kind === "short")
    html =
      "<p>" +
      esc(
        b.short ||
          sentences
            .slice(0, Math.max(1, Math.ceil(sentences.length / 2)))
            .join(" "),
      ) +
      "</p>";
  else if (kind === "easy")
    html = "<p>" + esc(b.easy || b.short || text) + "</p>";
  else if (kind === "long")
    html =
      sanitize(b.html) +
      (b.example
        ? "<p>" + esc(b.example) + "</p>"
        : "<p>직접 이해한 내용이나 예제를 이 아래에 덧붙여 보세요.</p>");
  else if (kind === "example")
    html =
      sanitize(b.html) +
      (b.example
        ? "<p><strong>예를 들면</strong><br>" + esc(b.example) + "</p>"
        : "<p><strong>예시 메모</strong><br>실제 AI 예시 생성은 연결 후 사용할 수 있어요. 지금은 직접 예시를 작성할 수 있습니다.</p>");
  else {
    const box = document.createElement("div");
    box.innerHTML = b.html;
    let parts = $$("li", box).map((x) => x.textContent);
    if (!parts.length) parts = sentences.length ? sentences : [text];
    if (kind === "table")
      html =
        "<table><thead><tr><th>순서</th><th>핵심 내용</th></tr></thead><tbody>" +
        parts
          .map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p)}</td></tr>`)
          .join("") +
        "</tbody></table>";
    else if (kind === "list")
      html =
        "<ul>" + parts.map((p) => "<li>" + esc(p) + "</li>").join("") + "</ul>";
    else if (kind === "flow")
      html = parts
        .map(
          (p, i) =>
            "<p>" +
            esc(i + 1 + ". " + p) +
            (i < parts.length - 1 ? "<br>↓" : "") +
            "</p>",
        )
        .join("");
    else html = "<p>" + esc(parts.join(" ")) + "</p>";
  }
  if (
    html === b.html ||
    (plain(html) === text && ["short", "easy"].includes(kind))
  ) {
    toast(
      "현재 내용이 이미 간결해요. 직접 편집하거나 다른 방식을 선택해 주세요.",
    );
    return;
  }
  ui.pending = {
    noteId: note().id,
    blockId: b.id,
    html,
    kind,
    before: text.length,
  };
  showModal(
    "바뀐 내용을 확인해 주세요",
    `<div class="compare-grid"><section class="compare-pane"><small>기존</small><div class="compare-content">${sanitize(b.html)}</div></section><section class="compare-pane after"><small>변경 제안</small><div class="compare-content">${sanitize(html)}</div></section></div><p class="upload-note">${["table", "list", "flow", "paragraph"].includes(kind) ? "선택한 블록의 형식만 바꿉니다." : "샘플 편집 제안입니다. 실제 AI 문장 생성은 연결 후 지원됩니다."} 적용 전까지 원래 내용은 유지됩니다.</p>`,
    btn("원래대로", "close-modal", "btn secondary") +
      btn("변경 적용", "apply-edit", "btn primary"),
  );
}
function recordEdit(n, b, before, after, kind) {
  if (
    b.type === "memo" ||
    b.source === "class-notes" ||
    !dna(n.subject).learn ||
    before === after
  )
    return;
  data.history.push({
    id: uid(),
    noteId: n.id,
    subject: n.subject,
    block: b.id,
    before,
    after,
    kind,
    date: new Date().toISOString(),
  });
  data.history = data.history.slice(-500);
}

function applyEdit() {
  const p = ui.pending;
  if (!p) return;
  const n = data.notes.find((n) => n.id === p.noteId);
  const b = n?.blocks.find((b) => b.id === p.blockId);
  if (!b) return;
  snapshot();
  b.html = sanitize(p.html);
  if (b.classGenerated) b.classEdited = true;
  recordEdit(n, b, p.before, plain(b.html).length, p.kind);
  if (b.type === "callout") b.type = "text";
  n.updated = new Date().toISOString();
  save();
  closeModal();
  render();
  toast("선택한 블록에 변경을 적용했어요.");
}
function formulaExplain(mode) {
  const entries = {
    symbol: [
      "기호 설명",
      "<dl><dt>EAT</dt><dd>유효 접근 시간. 페이지 폴트를 포함한 평균 메모리 접근 시간.</dd><dt>p</dt><dd>한 번의 메모리 접근에서 페이지 폴트가 발생할 확률. 0 ≤ p ≤ 1.</dd><dt>ma</dt><dd>페이지 폴트가 없을 때의 메모리 접근 시간.</dd><dt>fault time</dt><dd>페이지 폴트 처리부터 해당 접근 완료까지의 총 시간.</dd></dl>",
    ],
    intuition: [
      "직관적으로 이해하기",
      "<p>대부분은 책상 위의 책을 바로 읽지만, 가끔 책장까지 다녀와야 한다고 생각해 보세요.</p><p>평균 시간은 <strong>바로 읽는 비율 × 읽는 시간 + 책장에 다녀오는 비율 × 전체 소요 시간</strong>이에요. 드물게 발생하는 긴 대기 시간도 평균에 큰 영향을 줄 수 있어요.</p>",
    ],
    derive: [
      "식이 만들어지는 과정",
      "<ol><li>페이지가 메모리에 있는 경우: 확률은 (1 − p), 소요 시간은 ma.</li><li>페이지 폴트가 발생하는 경우: 확률은 p, 전체 소요 시간은 fault time.</li><li>두 경우의 시간에 각각 발생 확률을 곱해 더한다.</li></ol><p>fault time을 이미 전체 시간으로 정의했으므로, ma를 여기에 다시 더하지 않습니다.</p>",
    ],
    example: [
      "숫자로 확인하기",
      "<p>ma = 100ns, fault time = 8ms, p = 0.0001로 가정해 볼게요.</p><p>8ms = 8,000,000ns</p><p>EAT = 0.9999 × 100 + 0.0001 × 8,000,000<br>= 99.99 + 800<br>= <strong>899.99ns</strong></p><p>폴트가 10,000번 중 한 번만 발생해도 평균 접근 시간이 약 9배가 됩니다.</p>",
    ],
  };
  const [title, content] = entries[mode];
  showModal(
    title,
    `<div class="formula">EAT = (1 − p) × ma + p × fault time</div><div class="formula-explanation">${content}</div>`,
    btn("닫기", "close-modal", "btn primary"),
    "유효 접근 시간 · 준비된 개념 설명",
  );
}
function selectBlock(id) {
  const b = note()?.blocks.find((b) => b.id === id);
  if (!b) return;
  ui.selected = id;
  $$(".note-block").forEach((el) => {
    el.classList.toggle("selected", el.dataset.block === id);
    $(".context-toolbar", el)?.remove();
  });
  const el = $("#block-" + CSS.escape(id));
  el?.insertAdjacentHTML("beforeend", toolbar(b));
}
function download(name, content, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function safeName(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 100) || "노트";
}
function exportNote(format) {
  closePopover();
  const n = note();
  if (format === "print") {
    window.print();
    return;
  }
  if (format === "html") {
    const content = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>${esc(n.title)}</title><style>body{font-family:sans-serif;max-width:800px;margin:60px auto;padding:24px;line-height:1.9;color:#353830}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}small{color:#888}section{margin:24px 0}</style><h1>${esc(n.title)}</h1><p>${esc(n.subject)}</p>${n.blocks.map((b) => `<section>${b.title ? `<h2>${esc(b.title)}</h2>` : ""}<small>${esc(b.source === "class-notes" ? "수업 필기 · " + (b.sourceName || "첨부 필기") : b.source === "memo" ? "내 메모" : b.source === "ai" ? "쉬운 설명" : b.source === "external" ? "외부 보충" : `${n.file} · p.${b.page || 1}`)}</small>${sanitize(b.html)}${b.formula ? `<p>${esc(b.formula)}</p>` : ""}</section>`).join("")}</html>`;
    download(safeName(n.title) + ".html", content, "text/html;charset=utf-8");
  } else {
    const markdown = n.blocks
      .map((b) => {
        let html = b.html
          .replace(/<br\s*\/?>(\n)?/gi, "\n")
          .replace(/<\/(p|div|li|tr)>/gi, "\n")
          .replace(/<li[^>]*>/gi, "- ")
          .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
          .replace(/<td[^>]*>/gi, " | ");
        return `${b.title ? "## " + b.title + "\n\n" : ""}${plain(html).trim()}${b.formula ? "\n\n" + b.formula : ""}\n\n> ${b.source === "class-notes" ? "수업 필기 · " + (b.sourceName || "첨부 필기") : b.source === "memo" ? "내 메모" : b.source === "ai" ? "쉬운 설명" : b.source === "external" ? "외부 참고 설명" : `${n.file} · p.${b.page || 1}`}`;
      })
      .join("\n\n");
    download(
      safeName(n.title) + ".md",
      `# ${n.title}\n\n${n.subject}\n\n${markdown}`,
      "text/markdown;charset=utf-8",
    );
  }
  toast("노트를 내보냈어요.");
}
function templateModal(id) {
  const t = templates.find((t) => t.id === id);
  if (!t) return;
  ui.templateId = id;
  const d = { ...dna(), ...t };
  showModal(
    t.name,
    `<div class="preview-sheet" style="position:static;padding:20px;margin-bottom:22px"><h3>페이지 교체</h3>${dnaPreview(d)}</div><div class="form-field"><label for="template-subject">적용할 과목</label><select id="template-subject">${["기본", "운영체제", "알고리즘", "선형대수"].map((s) => `<option ${s === note()?.subject ? "selected" : ""}>${s}</option>`).join("")}</select></div><div class="control-label"><strong>가져올 항목</strong><small>내 설정과 조합하기</small></div><div class="choice-chips">${[
      ["density", "설명량"],
      ["formats", "정리 구조"],
      ["difficulty", "개념 설명"],
      ["formula", "수식 스타일"],
    ]
      .map(
        ([key, label]) =>
          `<label class="check-row"><input type="checkbox" name="remix" value="${key}" checked>${label}</label>`,
      )
      .join("")}</div>`,
    btn("취소", "close-modal", "btn secondary") +
      btn("선택한 설정 적용", "apply-template", "btn primary"),
    "원하는 항목만 골라 나의 Note DNA에 가져오세요.",
  );
}
function deleteNote(id) {
  const n = data.notes.find((n) => n.id === id);
  if (!n) return;
  ui.deleteId = id;
  showModal(
    "이 노트를 삭제할까요?",
    `<p style="font-size:14px">${esc(n.title)}</p><p class="upload-note">메모와 노트 내용이 목록에서 삭제됩니다. 이 세션에서는 실행 취소로 복원할 수 있어요.</p>`,
    btn("취소", "close-modal", "btn secondary") +
      btn("노트 삭제", "confirm-delete", "btn danger"),
  );
}
function handleAction(action, el = {}) {
  if (handleScopedAction(action, el)) return;
  if (handleStudyAction(action, el)) return;
  const n = note();
  const blockId =
    el.dataset?.block || el.closest?.(".note-block")?.dataset.block;
  if (blockId) ui.selected = blockId;
  const b = n?.blocks.find((b) => b.id === ui.selected);
  switch (action) {
    case "home":
      ui.filter = "전체";
      navigate("home");
      break;
    case "dna":
      navigate("dna");
      break;
    case "templates":
      navigate("templates");
      break;
    case "open-note":
      openNote(el.dataset.id);
      break;
    case "course":
      ui.expanded =
        ui.expanded === el.dataset.subject ? "" : el.dataset.subject;
      render();
      break;
    case "mobile":
      if (document.body.classList.contains("focus-mode")) {
        document.body.classList.remove("focus-mode");
        return;
      }
      $(".sidebar").classList.toggle("open");
      $(".mobile-shade").classList.toggle("open");
      break;
    case "mobile-close":
      $(".sidebar").classList.remove("open");
      $(".mobile-shade").classList.remove("open");
      break;
    case "favorite":
      snapshot();
      n.starred = !n.starred;
      save();
      el.setAttribute("aria-pressed", String(!!n.starred));
      el.style.color = n.starred ? "#b39f70" : "";
      el.setAttribute(
        "aria-label",
        "즐겨찾기 " + (n.starred ? "해제" : "추가"),
      );
      toast(n.starred ? "즐겨찾기에 추가했어요." : "즐겨찾기에서 해제했어요.");
      break;
    case "filter":
      ui.filter = el.dataset.filter;
      render();
      break;
    case "study":
      ui.exam = false;
      ui.selected = null;
      render();
      break;
    case "exam":
      ui.exam = true;
      ui.selected = null;
      render();
      break;
    case "source-toggle":
      if (!n.sample) {
        showActualSource();
        return;
      }
      ui.sourceOpen = !ui.sourceOpen;
      render();
      break;
    case "block-source":
      if (b?.source === "class-notes") {
        classSourceModal(b);
        return;
      }
      if (b?.source === "external" || b?.source === "ai") {
        evidence();
        return;
      }
      if (!n.sample) {
        showActualSource();
        return;
      }
      ui.page = b?.page || 1;
      ui.sourceOpen = true;
      render();
      $(".source-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      break;
    case "memo-info":
      toast("직접 작성한 메모입니다. 자동 편집에서 보호돼요.");
      break;
    case "page-prev":
      ui.page = Math.max(1, ui.page - 1);
      render();
      break;
    case "page-next":
      ui.page = Math.min(n.pages || 1, ui.page + 1);
      render();
      break;
    case "outline":
      {
        const folded = $("#block-" + CSS.escape(el.dataset.id) + " details");
        if (folded) folded.open = true;
      }
      $("#block-" + CSS.escape(el.dataset.id))?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      $$(".outline button").forEach((x) =>
        x.classList.toggle("active", x === el),
      );
      selectBlock(el.dataset.id);
      break;
    case "select-block":
      selectBlock(blockId);
      break;
    case "add-memo":
      snapshot();
      const memo = {
        id: uid(),
        title: "",
        type: "memo",
        source: "memo",
        priority: 1,
        html: "<p><br></p>",
      };
      n.blocks.push(memo);
      ui.selected = memo.id;
      changed();
      render();
      const content = $("#block-" + CSS.escape(memo.id) + " .block-content");
      content.focus();
      content.scrollIntoView({ behavior: "smooth", block: "center" });
      break;
    case "refine-menu":
      popover(
        el,
        `<span class="menu-label">내용 다듬기</span>${item("더 짧게", "edit-short", "text")}${item("더 자세하게", "edit-long", "list")}${item("쉽게 풀어서", "edit-easy", "light")}${item("예시 추가", "edit-example", "plus")}<div class="menu-divider"></div><div class="menu-range"><label for="block-density" class="menu-label">설명량 조절</label><input id="block-density" class="range" type="range" min="1" max="3" value="2"><div class="range-labels"><span>간단</span><span>자세히</span></div>${btn("변경 미리보기", "length-preview")}</div>`,
      );
      break;
    case "format-menu":
      popover(
        el,
        `<span class="menu-label">정리 형태</span>${item("글머리표로", "edit-list", "list")}${item("표로 정리", "edit-table", "table")}${item("흐름도로", "edit-flow", "layout")}${item("문단으로", "edit-paragraph", "text")}`,
      );
      break;
    case "block-menu":
      popover(
        el,
        `${item(b?.priority >= 2 ? "중요 표시 해제" : "중요 표시", "important", "star")}${item("메모 추가", "add-memo", "pen")}${item("블록 복제", "duplicate-block", "copy")}<div class="menu-divider"></div>${item("위로 이동", "move-up", "move")}${item("아래로 이동", "move-down", "move")}${item("제목 변경", "rename-block", "text")}<div class="menu-divider"></div>${btn(icon("trash") + "블록 삭제", "delete-block", "danger")}`,
      );
      break;
    case "formula-menu":
      popover(
        el,
        `<span class="menu-label">수식 이해하기</span>${item("기호 설명", "formula-symbol", "text")}${item("직관적으로", "formula-intuition", "light")}${item("유도 과정", "formula-derive", "list")}${item("계산 예시", "formula-example", "table")}`,
      );
      break;
    case "document-menu":
      popover(
        el,
        `${item("집중해서 읽기", "focus", "expand")}${item("노트 복제", "duplicate-note", "copy")}${item("실행 취소", "undo", "history")}${item("내용과 파일 보관 안내", "about", "lock")}<div class="menu-divider"></div>${btn(icon("trash") + "노트 삭제", "delete-note", "danger")}`,
      );
      break;
    case "row-menu":
      ui.rowId = el.dataset.id;
      popover(
        el,
        `${item("노트 열기", "row-open", "file")}${item("즐겨찾기 전환", "row-favorite", "star")}<div class="menu-divider"></div>${btn(icon("trash") + "노트 삭제", "row-delete", "danger")}`,
      );
      break;
    case "row-open":
      openNote(ui.rowId);
      break;
    case "row-favorite":
      snapshot();
      const rn = data.notes.find((x) => x.id === ui.rowId);
      rn.starred = !rn.starred;
      save();
      render();
      break;
    case "row-delete":
      deleteNote(ui.rowId);
      break;
    case "export-menu":
      popover(
        el,
        `<span class="menu-label">노트 내보내기</span>${item("Markdown (.md)", "export-md", "file")}${item("웹 문서 (.html)", "export-html", "globe")}${item("인쇄 / PDF 저장", "export-print", "download")}`,
      );
      break;
    case "export-md":
      exportNote("md");
      break;
    case "export-html":
      exportNote("html");
      break;
    case "export-print":
      exportNote("print");
      break;
    case "focus":
      closePopover();
      document.body.classList.toggle("focus-mode");
      break;
    case "undo":
      closePopover();
      if (!undoStack.length) {
        toast("되돌릴 변경 사항이 없어요.");
        return;
      }
      data = JSON.parse(undoStack.pop());
      if (!note()) ui.noteId = data.notes[0]?.id;
      save();
      render();
      toast("이전 상태로 되돌렸어요.");
      break;
    case "important":
      if (!b) return;
      snapshot();
      b.priority = b.priority >= 2 ? 1 : 3;
      if (b.classGenerated) b.classEdited = true;
      changed();
      render();
      toast(
        b.priority >= 2
          ? "시험 모드에 표시할 개념으로 지정했어요."
          : "중요 표시를 해제했어요.",
      );
      break;
    case "duplicate-block":
      if (!b) return;
      snapshot();
      const copy = { ...structuredClone(b), id: uid() };
      if (copy.classGenerated) copy.classEdited = true;
      n.blocks.splice(n.blocks.indexOf(b) + 1, 0, copy);
      ui.selected = copy.id;
      changed();
      render();
      toast("블록을 복제했어요.");
      break;
    case "delete-block":
      if (!b) return;
      snapshot();
      n.blocks = n.blocks.filter((x) => x.id !== b.id);
      ui.selected = null;
      changed();
      render();
      toast("블록을 삭제했어요. 노트 메뉴에서 실행 취소할 수 있어요.");
      break;
    case "move-up":
    case "move-down":
      if (!b) return;
      const index = n.blocks.indexOf(b),
        target = index + (action === "move-up" ? -1 : 1);
      if (target < 0 || target >= n.blocks.length) {
        toast(
          action === "move-up" ? "첫 번째 블록이에요." : "마지막 블록이에요.",
        );
        return;
      }
      snapshot();
      n.blocks.splice(index, 1);
      n.blocks.splice(target, 0, b);
      if (b.classGenerated) b.classEdited = true;
      changed();
      render();
      break;
    case "rename-block":
      showModal(
        "블록 제목",
        `<label class="form-field"><span>목차에 표시할 제목</span><input id="block-new-title" maxlength="100" value="${esc(b?.title || "")}" placeholder="제목을 비우면 목차에서 제외됩니다."></label>`,
        btn("취소", "close-modal", "btn secondary") +
          btn("저장", "save-block-title", "btn primary"),
      );
      break;
    case "save-block-title":
      if (!b) return;
      snapshot();
      b.title = $("#block-new-title").value.trim();
      if (b.classGenerated) b.classEdited = true;
      changed();
      closeModal();
      render();
      break;
    case "duplicate-note":
      snapshot();
      const nc = structuredClone(n);
      nc.id = uid();
      nc.title += " (복사)";
      nc.shortTitle = nc.title;
      nc.blocks.forEach((x) => (x.id = uid()));
      nc.updated = new Date().toISOString();
      data.notes.unshift(nc);
      save();
      openNote(nc.id);
      toast("노트를 복제했어요.");
      break;
    case "delete-note":
      deleteNote(n.id);
      break;
    case "confirm-delete":
      snapshot();
      data.notes = data.notes.filter((x) => x.id !== ui.deleteId);
      if (ui.noteId === ui.deleteId) ui.noteId = data.notes[0]?.id;
      save();
      closeModal();
      navigate("home");
      toast("노트를 삭제했어요.");
      break;
    case "evidence":
      evidence();
      break;
    case "evidence-original":
      ui.page = b?.page || 1;
      closeModal();
      if (n.sample) {
        ui.sourceOpen = true;
        render();
        $(".source-panel")?.scrollIntoView({ behavior: "smooth" });
      } else showActualSource();
      break;
    case "length-preview":
      stageEdit(
        ["short", "easy", "long"][Number($("#block-density").value) - 1],
      );
      break;
    case "apply-edit":
      applyEdit();
      break;
    case "close-modal":
      closeModal();
      break;
    case "upload":
      uploadModal();
      break;
    case "clear-file":
      ui.upload = null;
      $("#material-file").value = "";
      $("#picked-file").innerHTML = "";
      refreshNewNoteSources();
      break;
    case "create-note":
      void createNote();
      break;
    case "sample-note":
      snapshot();
      const sample = structuredClone(seedNotes[0]);
      sample.id = uid();
      sample.title = "가상 메모리와 페이지 교체 · 체험";
      sample.shortTitle = "예시 노트 체험";
      sample.runSettings = structuredClone(ui.newNoteSettings || noteDefaults);
      sample.runSettings.sourceIds = sample.runSettings.sourceIds.filter(
        (id) => id === "material",
      );
      sample.updated = new Date().toISOString();
      sample.blocks.forEach((x) => (x.id = uid()));
      data.notes.unshift(sample);
      save();
      closeModal();
      openNote(sample.id);
      toast("예시 노트에서 편집 흐름을 체험해 보세요.");
      break;
    case "dna-subject":
      if (ui.draft) commitScopedDraft();
      save();
      ui.dnaSubject = el.dataset.subject;
      ui.draft = structuredClone(dna(ui.dnaSubject));
      render();
      break;
    case "dna-format":
      const fmt = el.dataset.value;
      ui.draft.formats = ui.draft.formats.includes(fmt)
        ? ui.draft.formats.filter((x) => x !== fmt)
        : [...ui.draft.formats, fmt];
      el.classList.toggle("selected");
      el.setAttribute("aria-pressed", String(ui.draft.formats.includes(fmt)));
      refreshDNAPreview();
      break;
    case "dna-choice":
      ui.draft[el.dataset.key] = el.dataset.value;
      for (const x of $$('[data-key="' + el.dataset.key + '"]')) {
        x.classList.toggle("selected", x === el);
        x.setAttribute("aria-pressed", String(x === el));
      }
      refreshDNAPreview();
      break;
    case "save-dna":
      commitScopedDraft();
      save();
      toast("개인 취향과 과목별 설정을 저장했어요.");
      break;
    case "style-import":
      $("#style-file").click();
      break;
    case "template-preview":
      templateModal(el.dataset.id);
      break;
    case "apply-template":
      const t = templates.find((x) => x.id === ui.templateId);
      const s = $("#template-subject").value;
      const keys = $$('input[name="remix"]:checked').map((x) => x.value);
      if (!keys.length) {
        toast("가져올 항목을 하나 이상 선택해 주세요.");
        return;
      }
      applyScopedTemplate(s, t, keys);
      save();
      closeModal();
      ui.dnaSubject = s;
      ui.draft = structuredClone(dna(s));
      ui.view = "dna";
      render();
      toast("선택한 항목을 내 정리 방식에 적용했어요.");
      break;
    case "export-dna":
      download(
        "Note-DNA-settings.json",
        JSON.stringify(
          {
            name: "나의 Note DNA",
            version: 6,
            personal: personalSettings(),
            subjects: data.subjectDNA,
            learning: data.learningDNA,
            notes: data.notes.map((n) => ({
              id: n.id,
              title: n.title,
              settings: noteSettings(n),
            })),
          },
          null,
          2,
        ),
        "application/json",
      );
      toast("공유할 수 있는 DNA 파일을 내보냈어요.");
      break;
    case "about":
      showModal(
        "이 노트 공간에 대해",
        `<div class="formula-explanation"><p><strong>작성한 노트와 설정</strong>은 이 브라우저에 저장됩니다. 첨부한 파일도 기기 안에 보관됩니다.</p><p>샘플 노트의 다듬기 제안과 수식 설명은 미리 준비된 내용입니다. 실제 AI 분석·웹 검색·계정 동기화는 연결 전입니다.</p><p>중요한 노트는 Markdown이나 HTML 파일로 내보내 보관해 주세요.</p></div>`,
        btn("확인", "close-modal", "btn primary"),
      );
      break;
    default:
      if (action.startsWith("edit-")) stageEdit(action.slice(5));
      else if (action.startsWith("formula-")) formulaExplain(action.slice(8));
  }
}
const beforeEdit = new WeakMap();
document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]");
  if (action) {
    e.preventDefault();
    handleAction(action.dataset.action, action);
    return;
  }
  const block = e.target.closest(".note-block");
  if (e.target.closest("summary")) return;
  if (block) {
    selectBlock(block.dataset.block);
    return;
  }
  if (!e.target.closest("#popover")) closePopover();
});
document.addEventListener("focusin", (e) => {
  if (e.target.matches(".block-content")) {
    beforeEdit.set(e.target, plain(e.target.innerHTML));
    snapshot();
    selectBlock(e.target.closest(".note-block").dataset.block);
  } else if (e.target.id === "note-title") {
    snapshot();
  }
});
document.addEventListener("focusout", (e) => {
  if (e.target.matches(".block-content")) {
    const id = e.target.closest(".note-block").dataset.block;
    const b = note()?.blocks.find((x) => x.id === id);
    if (b) {
      const before = beforeEdit.get(e.target);
      if (before !== undefined && before !== plain(b.html)) {
        recordEdit(note(), b, before.length, plain(b.html).length, "manual");
        changed();
      }
    }
  }
  if (e.target.id === "note-title" && !e.target.textContent.trim()) {
    e.target.textContent = "제목 없는 노트";
    note().title = "제목 없는 노트";
    note().shortTitle = note().title;
    changed();
  }
});
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.matches(".block-content")) {
    const b = note()?.blocks.find(
      (b) => b.id === el.closest(".note-block").dataset.block,
    );
    if (b) {
      b.html = sanitize(el.innerHTML);
      if (b.classGenerated) b.classEdited = true;
      changed();
    }
  } else if (el.id === "note-title") {
    note().title = el.textContent.trim().slice(0, 150) || "제목 없는 노트";
    note().shortTitle = note().title;
    document.title = note().title + " — Note DNA";
    changed();
  } else if (el.id === "note-search") {
    ui.query = el.value;
    $("#note-rows").innerHTML = noteRows();
  } else if (el.id === "density") {
    ui.draft.density = Number(el.value);
    refreshDNAPreview();
  } else if (el.id === "class-weight") {
    ui.draft.classWeight = Number(el.value);
    refreshClassDNA();
  } else if (el.id === "custom-prompt") {
    ui.draft.prompt = el.value;
    $("#prompt-count").textContent = el.value.length;
  }
});
document.addEventListener("change", async (e) => {
  const el = e.target;
  if (el.id === "class-file") await selectClassFile(el.files[0]);
  else if (el.id === "material-file") selectFile(el.files[0]);
  else if (el.id === "upload-subject") {
    $("#new-subject").hidden = el.value !== "__new";
    $("#new-subject-dna").hidden = el.value !== "__new";
    if (el.value === "__new") $("#new-subject").focus();
    updateConditionalSettings("new-note");
  } else if (el.dataset.dnaCheck) {
    ui.draft[el.dataset.dnaCheck] = el.checked;
    if (el.dataset.dnaCheck === "learn") data.personalDNA.learn = el.checked;
    save();
    refreshDNAPreview();
  } else if (el.id === "research-setting") {
    ui.draft.research = el.value;
    refreshDNAPreview();
  } else if (el.id === "style-file") {
    const file = el.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast("기존 노트는 1MB 이하로 가져와 주세요.");
      return;
    }
    try {
      const text = await file.text();
      if (!text.trim()) {
        toast("내용이 있는 노트를 선택해 주세요.");
        return;
      }
      const lines = text.split("\n").filter((x) => x.trim());
      const avg = lines.reduce((s, x) => s + x.length, 0) / lines.length;
      ui.draft.density = avg < 45 ? 1 : avg < 100 ? 2 : 3;
      ui.draft.formats = [];
      if (lines.some((x) => /^\s*[-*•]\s/.test(x)))
        ui.draft.formats.push("글머리표");
      if (lines.some((x) => x.includes("|"))) ui.draft.formats.push("표");
      if (!ui.draft.formats.length) ui.draft.formats = ["긴 문단"];
      ui.draft.star = /[★⭐]/.test(text);
      render();
      toast("문장 길이와 형식을 바탕으로 설정 초안을 만들었어요.");
    } catch {
      toast("노트를 읽지 못했어요. UTF-8 텍스트 파일을 선택해 주세요.");
    }
  }
});
document.addEventListener("paste", (e) => {
  if (!e.target.closest('[contenteditable="true"]')) return;
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  e.target.dispatchEvent(new Event("input", { bubbles: true }));
});
document.addEventListener("keydown", (e) => {
  const editing = e.target.matches(
    'input,textarea,select,[contenteditable="true"]',
  );
  if (e.key === "Escape") {
    closePopover();
    if (document.body.classList.contains("focus-mode"))
      document.body.classList.remove("focus-mode");
    $(".sidebar")?.classList.remove("open");
    $(".mobile-shade")?.classList.remove("open");
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    save();
    toast("이 기기에 저장했어요.");
  }
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key.toLowerCase() === "z" &&
    !editing &&
    !$("#modal").open
  ) {
    e.preventDefault();
    handleAction("undo", e.target);
  }
  if (
    !editing &&
    e.key === "Enter" &&
    e.target.classList.contains("note-block")
  ) {
    e.preventDefault();
    selectBlock(e.target.dataset.block);
    const detail = $("details.supplementary", e.target);
    if (detail) detail.open = true;
    $(".block-content", e.target).focus();
  }
  if (
    e.target.id === "class-drop-zone" &&
    (e.key === "Enter" || e.key === " ")
  ) {
    e.preventDefault();
    $("#class-file").click();
  }
  if (e.target.id === "drop-zone" && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    $("#material-file").click();
  }
  if (
    e.target.closest("#popover") &&
    ["ArrowDown", "ArrowUp"].includes(e.key)
  ) {
    e.preventDefault();
    const list = $$("button,input", $("#popover"));
    const i = list.indexOf(e.target);
    list[
      (i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length
    ]?.focus();
  }
});
document.addEventListener("dragstart", (e) => {
  const handle = e.target.closest(".block-handle");
  if (!handle) return;
  dragId = handle.dataset.block;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragId);
  handle.closest(".note-block").classList.add("dragging");
});
document.addEventListener("dragover", (e) => {
  const zone = e.target.closest("#drop-zone, #class-drop-zone");
  if (zone) {
    e.preventDefault();
    zone.classList.add("dragover");
    return;
  }
  const block = e.target.closest(".note-block");
  if (block && dragId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    $$(".drop-target").forEach((x) => x.classList.remove("drop-target"));
    block.classList.add("drop-target");
  }
});
document.addEventListener("dragleave", (e) => {
  e.target
    .closest("#drop-zone, #class-drop-zone")
    ?.classList.remove("dragover");
});
document.addEventListener("drop", (e) => {
  const zone = e.target.closest("#drop-zone, #class-drop-zone");
  if (zone) {
    e.preventDefault();
    zone.classList.remove("dragover");
    if (zone.id === "class-drop-zone")
      void selectClassFile(e.dataTransfer.files[0]);
    else selectFile(e.dataTransfer.files[0]);
    return;
  }
  const block = e.target.closest(".note-block");
  if (block && dragId) {
    e.preventDefault();
    const target = block.dataset.block;
    if (target !== dragId) {
      const ns = note().blocks;
      const from = ns.findIndex((b) => b.id === dragId);
      const to = ns.findIndex((b) => b.id === target);
      if (from >= 0 && to >= 0) {
        snapshot();
        const moved = ns.splice(from, 1)[0];
        if (moved.classGenerated) moved.classEdited = true;
        ns.splice(to, 0, moved);
        changed();
        render();
        toast("블록 순서와 목차를 업데이트했어요.");
      }
    }
    dragId = null;
  }
});
document.addEventListener("dragend", () => {
  dragId = null;
  $$(".dragging,.drop-target").forEach((x) =>
    x.classList.remove("dragging", "drop-target"),
  );
});
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeModal();
  }
});
$("#modal").addEventListener("close", () => {
  ui.pending = null;
  ui.classPlan = null;
  ui.classToken = null;
});
window.addEventListener("beforeunload", () => {
  clearTimeout(saveTimer);
  save();
});
window.addEventListener("resize", closePopover);
// Optional, page-scoped agent access follows the same UI actions and local state.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const definitions = [
    {
      name: "list_notes",
      title: "노트 목록 보기",
      description: "List locally saved notes without changing them.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        if (!input || typeof input !== "object" || Object.keys(input).length)
          throw new Error("Expected an empty object.");
        return data.notes.map((n) => ({
          id: n.id,
          title: n.title,
          subject: n.subject,
        }));
      },
    },
    {
      name: "open_note",
      title: "노트 열기",
      description: "Open an existing local note in the visible editor.",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute(input) {
        if (
          !input ||
          typeof input.id !== "string" ||
          Object.keys(input).some((k) => k !== "id") ||
          !data.notes.some((n) => n.id === input.id)
        )
          throw new Error("A valid note id is required.");
        openNote(input.id);
        return { id: note().id, title: note().title, view: ui.view };
      },
    },
  ];
  for (const definition of definitions) {
    try {
      Promise.resolve(
        document.modelContext.registerTool(definition, {
          signal: lifecycle.signal,
        }),
      ).catch(() => {});
    } catch {}
  }
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}

// Expand supplementary examples for printing, then restore the reading state.
let printSections = [];
window.addEventListener("beforeprint", () => {
  printSections = $$("details.supplementary").map((el) => [el, el.open]);
  for (const [el] of printSections) el.open = true;
});
window.addEventListener("afterprint", () => {
  for (const [el, open] of printSections) el.open = open;
  printSections = [];
});
document.addEventListener(
  "toggle",
  (e) => {
    if (e.target.matches?.("details.supplementary")) {
      const label = $(".expand-hint", e.target);
      if (label) label.textContent = e.target.open ? "접기" : "펼쳐보기";
    }
  },
  true,
);
