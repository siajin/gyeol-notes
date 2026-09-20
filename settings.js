"use strict";
// Version 4: stable personal style, course content, and independent learning DNA.
const personalDefaults = {
  headingStyle: "일반적인 3단계",
  numbering: "1. → 1) → a.",
  layoutPreference: "표와 목록을 적절히 혼합",
  emphasisStyle: "별표",
  emphasisAmount: "핵심만",
  tone: "쉬운 설명체",
  learn: true,
};
const subjectDefaults = {
  organization: "이해하기 좋은 흐름으로",
  mode: "개념 이해",
  examplePreference: "다양한 예시 3개 이상",
  hasMath: true,
  formula: "유도 과정과 계산 예시",
  terminology: "모든 전문용어를 자세히 설명",
  length: "적당한 분량",
  lectureWeight: 3,
  textbookWeight: 2,
  classWeight: 2,
  professorWeight: 3,
  research: "lecture",
  visuals: "AI가 자동 선택",
  classPriority: 2,
  classEmphasis: true,
};
const learningDefaults = {
  problemTypes: ["객관식", "주관식", "OX"],
  questionCount: 5,
  questionDifficulty: "강의 수준",
  examRange: "",
  chapterMode: "챕터별",
};
const noteDefaults = { sourceMode: "all", sourceIds: [], prompt: "" };
const personalOptions = {
  headingStyle: ["간단하게 2단계", "일반적인 3단계", "자세하게 4단계"],
  numbering: ["1. → 1) → a.", "1. → (1) → ①", "글머리표 중심"],
  layoutPreference: ["목록 중심", "표와 목록을 적절히 혼합", "표 중심"],
  emphasisStyle: ["별표", "빨간줄"],
  emphasisAmount: ["적게", "핵심만", "많이"],
  tone: ["간결한 노트체", "쉬운 설명체", "강의 필기체"],
};
const toneExamples = {
  "간결한 노트체":
    "프로세스: 실행 중인 프로그램. 메모리에 적재되며 CPU 자원을 할당받아 실행됨.",
  "쉬운 설명체":
    "프로세스는 현재 실행되고 있는 프로그램을 의미한다. 쉽게 말하면 프로그램이 실제로 동작하기 시작한 상태라고 볼 수 있다.",
  "강의 필기체":
    "프로세스 = 실행 중인 프로그램\n프로그램은 정적, 프로세스는 동적\n시험: 프로그램과 프로세스의 차이 주의",
};
const modePresets = {
  "개념 이해": {
    examplePreference: "다양한 예시 3개 이상",
    formula: "유도 과정과 계산 예시",
    terminology: "모든 전문용어를 자세히 설명",
    research: "lecture",
    lectureWeight: 3,
    professorWeight: 3,
    classWeight: 2,
    description: "PDF·교수님 설명 중심",
    detail:
      "예시와 수식·용어 설명을 늘리고, PDF 밖의 외부 자료는 사용하지 않아요.",
  },
  "심화 학습": {
    examplePreference: "핵심 예시 1개",
    formula: "결과만 표시",
    terminology: "핵심 용어만",
    research: "academic",
    lectureWeight: 2,
    professorWeight: 2,
    classWeight: 2,
    description: "외부 자료로 더 깊게",
    detail:
      "예시와 수식·용어의 기본 설명은 줄이고, PDF 밖의 학술자료와 응용 내용을 보강해요.",
  },
  "시험 대비": {
    examplePreference: "개념별 예시 2개",
    formula: "의미와 사용법 설명",
    terminology: "처음 등장할 때 설명",
    research: "balanced",
    lectureWeight: 3,
    professorWeight: 3,
    classWeight: 3,
    description: "교수 강조·필기 중심",
    detail:
      "시험에 필요한 설명과 개인 필기를 우선해요. 문제 유형과 시험 범위는 학습 DNA에서 정해요.",
  },
};
function pickSettings(source, defaults) {
  return Object.fromEntries(
    Object.keys(defaults).map((k) => [
      k,
      structuredClone(source[k] ?? defaults[k]),
    ]),
  );
}
function initializeScopedSettings() {
  if (data.settingsVersion === 4) return;
  const oldPersonal = data.personalDNA || {},
    oldSubjects = data.subjectDNA || {},
    oldLearning = data.learningDNA || {},
    oldOverrides = data.personalOverrides || {};
  if (data.settingsVersion)
    data.previousDNA = {
      version: data.settingsVersion,
      personal: structuredClone(oldPersonal),
      subjects: structuredClone(oldSubjects),
      overrides: structuredClone(oldOverrides),
    };
  try {
    data.basicDNAReady ??= Boolean(localStorage.getItem(KEY));
  } catch {
    data.basicDNAReady ??= false;
  }
  const legacy = { ...defaultDNA, ...data.dna.기본 };
  const toneMap = {
    "짧고 간결하게": "간결한 노트체",
    "쉽고 친근하게": "쉬운 설명체",
    "교재처럼 공식적으로": "간결한 노트체",
  };
  data.personalDNA = pickSettings(
    {
      ...oldPersonal,
      tone:
        toneMap[oldPersonal.tone] || oldPersonal.tone || personalDefaults.tone,
      layoutPreference:
        oldPersonal.layoutPreference ||
        (legacy.formats?.includes("표")
          ? legacy.formats?.includes("글머리표")
            ? "표와 목록을 적절히 혼합"
            : "표 중심"
          : "목록 중심"),
      emphasisStyle: oldPersonal.emphasisStyle || "별표",
      emphasisAmount:
        oldPersonal.emphasisAmount ||
        {
          최소한으로: "적게",
          "핵심만 강조": "핵심만",
          "시험 중요 내용까지 적극 강조": "많이",
        }[oldPersonal.emphasis] ||
        "핵심만",
      learn: oldPersonal.learn ?? legacy.learn,
    },
    personalDefaults,
  );
  data.subjectDNA = {};
  data.learningDNA = {};
  const subjects = new Set([
    ...Object.keys(oldSubjects),
    ...Object.keys(data.dna),
    ...data.notes.map((n) => n.subject),
  ]);
  for (const subject of subjects) {
    const old = oldSubjects[subject] || {},
      legacyCourse = data.dna[subject] || {},
      override = oldOverrides[subject] || {};
    const recent = data.notes
      .filter((n) => n.subject === subject)
      .sort((a, b) =>
        String(b.updated || "").localeCompare(String(a.updated || "")),
      )[0];
    const run = recent?.runSettings || {};
    const mode = Object.hasOwn(modePresets, old.mode)
      ? old.mode
      : Object.hasOwn(modePresets, run.mode)
        ? run.mode
        : "개념 이해";
    const preset = pickSettings(modePresets[mode], subjectDefaults);
    const oldFormula = {
      수식만: "결과만 표시",
      "수식 + 설명": "의미와 사용법 설명",
      "자세한 풀이": "유도 과정과 계산 예시",
    }[legacyCourse.formula];
    data.subjectDNA[subject] = pickSettings(
      {
        ...preset,
        ...old,
        mode,
        organization:
          old.organization ||
          override.organization ||
          oldPersonal.organization ||
          subjectDefaults.organization,
        examplePreference:
          old.examplePreference ||
          override.examplePreference ||
          oldPersonal.examplePreference ||
          preset.examplePreference,
        formula: old.formula || oldFormula || preset.formula,
        length: old.length || run.length || subjectDefaults.length,
        classWeight:
          old.classWeight ?? legacyCourse.classWeight ?? preset.classWeight,
        classPriority: old.classPriority ?? legacyCourse.classPriority ?? 2,
      },
      subjectDefaults,
    );
    // Apply the revised mode policy once; later manual adjustments remain intact.
    data.subjectDNA[subject] = applySubjectMode(data.subjectDNA[subject], mode);
    const oldTypes = old.problemType || "";
    const types =
      oldTypes === "객관식 중심"
        ? ["객관식"]
        : ["주관식·서술형 중심", "계산·응용 중심"].includes(oldTypes)
          ? ["주관식"]
          : learningDefaults.problemTypes;
    const count =
      run.problemCountChoice === "custom"
        ? run.problemCount
        : run.problemCountChoice && run.problemCountChoice !== "dna"
          ? Number(run.problemCountChoice)
          : (old.questionCount ?? 5);
    data.learningDNA[subject] = pickSettings(
      {
        ...oldLearning[subject],
        problemTypes: oldLearning[subject]?.problemTypes || types,
        questionCount:
          oldLearning[subject]?.questionCount ??
          (oldTypes === "생성하지 않음"
            ? 0
            : Math.max(0, Math.min(100, Number.isFinite(count) ? count : 5))),
        questionDifficulty:
          oldLearning[subject]?.questionDifficulty ||
          old.questionDifficulty ||
          "강의 수준",
        examRange: oldLearning[subject]?.examRange || run.examRange || "",
      },
      learningDefaults,
    );
  }
  data.settingsVersion = 4;
}
function personalSettings() {
  return { ...personalDefaults, ...data.personalDNA };
}
function personalForSubject() {
  return personalSettings();
}
function subjectSettings(subject) {
  return { ...subjectDefaults, ...data.subjectDNA?.[subject] };
}
function learningSettings(subject = ui.dnaSubject) {
  return {
    ...structuredClone(learningDefaults),
    ...data.learningDNA?.[subject],
  };
}
function deriveDNA(personal, subject) {
  return {
    ...personal,
    ...subject,
    formats:
      personal.layoutPreference === "표 중심"
        ? ["표"]
        : personal.layoutPreference === "목록 중심"
          ? ["글머리표"]
          : ["글머리표", "표"],
    bold: personal.emphasisAmount !== "적게",
    star: personal.emphasisStyle === "별표",
    emphasis: personal.emphasisAmount === "적게" ? "최소한으로" : "핵심만 강조",
    examples: subject.examplePreference !== "예시 없이",
    density:
      subject.length === "핵심만 간단히"
        ? 1
        : subject.length === "최대한 자세히"
          ? 3
          : 2,
    difficulty:
      subject.terminology === "모든 전문용어를 자세히 설명"
        ? "쉽게 풀어서"
        : "원문 유지",
    prompt: "",
  };
}
function noteSettings(n = note()) {
  const s = subjectSettings(n?.subject),
    l = learningSettings(n?.subject),
    old = n?.runSettings || {};
  const sources = availableNoteSources(n),
    sourceIds = (old.sourceIds || []).filter((id) =>
      sources.some((s) => s.id === id),
    );
  return {
    ...noteDefaults,
    ...old,
    sourceIds,
    sourceMode: sources.length > 1 ? old.sourceMode || "all" : "all",
    mode: s.mode,
    length: s.length,
    examRange: l.examRange,
    problemCount: l.questionCount,
    problemDifficulty: l.questionDifficulty,
  };
}
function effectiveNoteDNA(n = note(), d = dna(n?.subject)) {
  const l = learningSettings(n?.subject),
    r = noteSettings(n);
  return {
    ...d,
    formula: d.hasMath ? d.formula : "수식 거의 없음",
    research: r.sourceMode === "all" ? d.research : "lecture",
    problemTypes: l.problemTypes,
    problemCount: l.questionCount,
    problemDifficulty: l.questionDifficulty,
    examRange: l.examRange,
    chapterMode: l.chapterMode,
    prompt: r.prompt,
  };
}
function commitScopedDraft() {}
function scopeSelect(scope, key, label, options, value, help = "") {
  return `<label class="dna-field"><span>${label}</span>${help ? `<small>${help}</small>` : ""}<select data-setting-scope="${scope}" data-setting-key="${key}">${options
    .map((o) => {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(v)}" ${String(v) === String(value) ? "selected" : ""}>${esc(t)}</option>`;
    })
    .join("")}</select></label>`;
}
function advancedSettings(label, content) {
  return `<details class="dna-advanced"><summary>${label}<span>펼쳐보기</span></summary><div class="dna-advanced-body">${content}</div></details>`;
}
function personalFields(d) {
  const select = (key, label) =>
    scopeSelect("personal", key, label, personalOptions[key], d[key]);
  return `<div class="dna-form-grid">${select("headingStyle", "제목 구조")}${select("numbering", "번호 표기 방식")}${select("layoutPreference", "표와 목록 선호도")}</div><fieldset class="dna-emphasis-group"><legend>강조 방식</legend><div class="dna-form-grid">${select("emphasisStyle", "표시 방법")}${select("emphasisAmount", "강조 정도")}</div></fieldset><fieldset class="dna-tone-group"><legend>문체</legend><p>같은 내용을 어떻게 읽고 싶은지 골라보세요.</p><div class="dna-tone-options">${personalOptions.tone.map((tone, i) => `<label class="dna-tone-card"><input type="radio" name="dna-tone" data-setting-scope="personal" data-setting-key="tone" value="${tone}" ${d.tone === tone ? "checked" : ""}><span><strong><small>0${i + 1}</small>${tone}</strong><span class="tone-sample">${esc(toneExamples[tone])}</span></span></label>`).join("")}</div></fieldset>`;
}
function organizationHelp(value) {
  return value === "강의자료 순서대로"
    ? "챕터 안에서 PDF 페이지와 PPT 슬라이드 순서를 유지해요."
    : value === "핵심 개념·키워드별"
      ? "챕터 안의 내용을 같은 개념과 키워드끼리 모아요."
      : "각 챕터에서 선수 개념부터 응용까지 이해하기 좋은 순서로 정리해요.";
}
function modeHint(d) {
  const p = modePresets[d.mode] || modePresets["개념 이해"];
  return `<strong>${p.description}</strong><span>${p.detail}</span>`;
}
function subjectFields(d, scope = "subject") {
  const select = (key, label, options, help = "") =>
    scopeSelect(scope, key, label, options, d[key], help);
  const weight = [
    [0, "반영 안 함"],
    [1, "낮게"],
    [2, "보통"],
    [3, "높게"],
  ];
  return `<section class="dna-section"><div class="dna-section-title"><span>01</span><h3>구조</h3><small>챕터 단위로 정리</small></div>${select("organization", "챕터 안의 정리 기준", ["강의자료 순서대로", "핵심 개념·키워드별", "이해하기 좋은 흐름으로"])}<p class="dna-inline-help" id="${scope}-organization-help">${organizationHelp(d.organization)}</p><fieldset class="dna-modes"><legend>학습 모드</legend><div class="dna-mode-options three-modes">${Object.keys(
    modePresets,
  )
    .map(
      (mode) =>
        `<label><input type="radio" name="${scope}-mode" data-setting-scope="${scope}" data-setting-key="mode" value="${mode}" ${d.mode === mode ? "checked" : ""}><strong>${mode}</strong></label>`,
    )
    .join(
      "",
    )}</div></fieldset><div id="${scope}-mode-hint" class="dna-mode-hint">${modeHint(d)}</div><p class="dna-setting-hint">모드를 바꾸면 아래 내용을 권장값으로 맞춰요. 이후 각 항목을 따로 조절할 수 있어요.</p></section><section class="dna-section"><div class="dna-section-title"><span>02</span><h3>내용</h3><small>설명과 자료의 비중</small></div><div class="dna-form-grid">${select("examplePreference", "예시 선호도", ["예시 없이", "핵심 예시 1개", "개념별 예시 2개", "다양한 예시 3개 이상"])}<div id="${scope}-formula" ${d.hasMath ? "" : "hidden"}>${select("formula", "수식 설명 수준", ["결과만 표시", "의미와 사용법 설명", "유도 과정과 계산 예시", "수식 거의 없음"])}</div>${select("terminology", "용어 설명 수준", ["핵심 용어만", "처음 등장할 때 설명", "모든 전문용어를 자세히 설명"])}${select("length", "노트 분량", ["핵심만 간단히", "적당한 분량", "최대한 자세히"])}${select(
    "research",
    "외부 자료 보강 정도",
    [
      ["lecture", "없음 · 외부 보강 안 함"],
      ["balanced", "부족한 내용만 보강"],
      ["deep", "적극적으로 보강"],
      ["academic", "학술자료로 심화 보강"],
    ],
    "업로드한 PDF에 없는 내용의 보강 정도",
  )}</div>${advancedSettings(
    "자료 반영도 · 시각자료",
    `<p class="settings-help">각 자료의 내용을 얼마나 우선해서 담을지 정해요.</p><div class="dna-form-grid">${select("lectureWeight", "강의자료 · PDF", weight)}${select("textbookWeight", "교재", weight)}${select("classWeight", "개인 필기", weight)}${select("professorWeight", "교수 설명", weight)}${select("visuals", "시각자료 종류", ["AI가 자동 선택", "마인드맵·개념도", "흐름도·구조도", "표·비교표", "생성하지 않음"])}${select(
      "classPriority",
      "개인 필기의 중요도",
      [
        [1, "참고"],
        [2, "중요"],
        [3, "최우선"],
      ],
    )}</div><label class="check-row"><input type="checkbox" data-setting-scope="${scope}" data-setting-key="hasMath" ${d.hasMath ? "checked" : ""}>수식이 있는 과목이에요</label><label class="check-row"><input type="checkbox" data-setting-scope="${scope}" data-setting-key="classEmphasis" ${d.classEmphasis ? "checked" : ""}>필기에 강조한 구절 우선 반영</label>`,
  )}</section>`;
}
function learningFields(d, scope = "learning") {
  return `<fieldset class="dna-question-types"><legend>문제 유형</legend><p>연습하고 싶은 유형을 함께 선택할 수 있어요.</p><div class="dna-type-options">${["객관식", "주관식", "OX"].map((type) => `<label><input type="checkbox" data-learning-type="${scope}" value="${type}" ${d.problemTypes.includes(type) ? "checked" : ""}>${type}</label>`).join("")}</div></fieldset><div class="dna-form-grid"><label class="dna-field"><span>문제 개수</span><div class="dna-number-wrap"><input type="number" min="0" max="100" step="1" data-setting-scope="${scope}" data-setting-key="questionCount" value="${d.questionCount}"><span>개</span></div><small>0개를 선택하면 문제를 생성하지 않아요.</small></label>${scopeSelect(scope, "questionDifficulty", "문제 난이도", ["기초", "강의 수준", "시험 수준", "심화"], d.questionDifficulty)}</div><label class="dna-field full"><span>이번 시험 범위</span><input data-setting-scope="${scope}" data-setting-key="examRange" maxlength="200" value="${esc(d.examRange)}" placeholder="예: 중간고사 2–5장, PDF 20–85페이지"><small>비워두면 등록된 자료 전체를 범위로 사용해요.</small></label><fieldset class="dna-chapter-group"><legend>출제 범위 구성</legend><div class="dna-chapter-options">${[
    ["챕터별", "각 챕터의 개념을 따로 확인"],
    ["챕터 융합", "여러 챕터의 개념을 연결해 응용"],
  ]
    .map(
      ([value, help]) =>
        `<label><input type="radio" name="${scope}-chapters" data-setting-scope="${scope}" data-setting-key="chapterMode" value="${value}" ${d.chapterMode === value ? "checked" : ""}><span><strong>${value}</strong><small>${help}</small></span></label>`,
    )
    .join(
      "",
    )}</div></fieldset><p class="dna-setting-hint">학습 모드와 별도로 저장됩니다. 모드를 바꿔도 문제 유형과 시험 범위는 유지돼요.</p>`;
}
function subjectPicker() {
  const subjects = [
    ...new Set([
      "운영체제",
      "알고리즘",
      "선형대수",
      ...data.notes.map((n) => n.subject),
      ...Object.keys(data.subjectDNA || {}).filter((s) => s !== "기본"),
      ui.dnaSubject,
    ]),
  ];
  return `<label class="dna-subject-picker"><span class="sr-only">설정할 과목</span><select id="settings-subject">${subjects.map((s) => `<option value="${esc(s)}" ${s === ui.dnaSubject ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>`;
}
function scopedSettingsPage() {
  const scope =
    ui.settingsScope === "note" ? "learning" : ui.settingsScope || "personal";
  ui.settingsScope = scope;
  const d = dna(ui.dnaSubject);
  ui.draft = structuredClone(d);
  const scopes = [
    ["personal", "기본 DNA", "나의 표현 방식"],
    ["subject", "과목별 DNA", "구조와 내용"],
    ["learning", "학습 DNA", "문제와 시험 준비"],
  ];
  const descriptions = {
    personal: "과목이 바뀌어도 유지되는, 나에게 익숙한 노트 스타일입니다.",
    subject: "각 챕터의 정리 흐름과 설명의 깊이를 이 과목에 맞춰요.",
    learning: "이 과목의 문제 유형, 난이도와 이번 시험 범위를 정해요.",
  };
  return `<section class="page dna-settings"><header class="page-header"><div><span class="dna-eyebrow">NOTE DNA</span><h1>나에게 맞는 정리</h1><p>표현은 나답게, 내용은 과목에 맞게, 복습은 목적에 맞게.</p></div><span class="dna-autosave" id="dna-save-state" role="status">${icon("check")} 자동 저장</span></header><nav class="dna-scope-tabs" aria-label="개인화 설정">${scopes.map(([key, title, sub]) => btn(`<strong>${title}</strong><small>${sub}</small>`, "settings-scope", key === scope ? "active" : "", `data-scope="${key}" aria-current="${key === scope ? "page" : "false"}"`)).join("")}</nav><div class="dna-settings-layout"><div class="dna-settings-main"><div class="dna-scope-heading"><div><h2>${scopes.find((s) => s[0] === scope)[1]}</h2><p>${descriptions[scope]}</p></div>${scope === "personal" ? "" : subjectPicker()}</div>${scope === "personal" ? personalFields(personalSettings()) : scope === "subject" ? subjectFields(subjectSettings(ui.dnaSubject)) : learningFields(learningSettings(ui.dnaSubject))}${scope === "personal" && !data.basicDNAReady ? `<div class="dna-onboarding-finish">${btn("이 설정으로 시작하기" + icon("arrow"), "finish-dna", "btn primary")}</div>` : ""}<p class="dna-scope-foot">${icon("lock")}${scope === "personal" ? "모든 과목에 같은 표현 방식을 사용합니다." : esc(ui.dnaSubject) + " 과목에만 저장됩니다."}</p>${scope === "subject" ? advancedSettings("편집 습관에서 발견했어요", `<div class="dna-habit-wrap">${habitPanel(ui.dnaSubject, d)}</div>`) : ""}</div><aside class="dna-settings-aside"><div class="dna-preview-card"><div class="preview-label">${icon("file")}${scope === "learning" ? "학습 구성 미리보기" : "노트 스타일 미리보기"}</div><div id="dna-preview">${scopedPreview(d)}</div><p class="dna-preview-help">설정에 따른 예시입니다. 기존 노트 본문은 유지되며, 실제 AI 정리·문제 생성은 연결 후 제공됩니다.</p></div></aside></div></section>`;
}
function styledTone(d) {
  const lines = (toneExamples[d.tone] || toneExamples["쉬운 설명체"]).split(
    "\n",
  );
  const mark = (text) =>
    d.emphasisStyle === "빨간줄"
      ? `<span class="dna-redline">${text}</span>`
      : `<span class="dna-star-mark">★</span> ${text}`;
  return lines
    .map((line, i) => {
      const text = esc(line);
      return `<p>${d.emphasisAmount === "많이" || (d.emphasisAmount === "핵심만" && i === 0) ? mark(text) : d.emphasisAmount === "적게" && i === 0 ? text.replace("프로세스", mark("프로세스")) : text}</p>`;
    })
    .join("");
}
function scopedPreview(d) {
  const scope = ui.settingsScope || "personal",
    l = learningSettings(ui.dnaSubject),
    s = subjectSettings(ui.dnaSubject);
  if (scope === "learning")
    return `<div class="dna-mini-note"><span class="dna-preview-caption">${esc(ui.dnaSubject)} · 학습 계획</span><h3>${l.questionCount ? l.questionCount + "개 문제로 복습" : "문제 생성 안 함"}</h3><div class="dna-learning-tags">${l.problemTypes.map((t) => `<span>${t}</span>`).join("")}</div><dl class="dna-plan-list"><div><dt>난이도</dt><dd>${esc(l.questionDifficulty)}</dd></div><div><dt>시험 범위</dt><dd>${esc(l.examRange || "등록된 자료 전체")}</dd></div><div><dt>출제 구성</dt><dd>${esc(l.chapterMode)}</dd></div></dl>${l.questionCount ? `<div class="dna-question-sample"><small>문항 형식 예시 · 실제 생성 아님</small><p>${l.chapterMode === "챕터 융합" ? "프로세스 관리와 메모리 관리를 연결해, 문맥 교환에 필요한 정보를 설명하시오." : l.problemTypes[0] === "OX" ? "프로세스는 실행 중인 프로그램이다. (O / X)" : l.problemTypes[0] === "주관식" ? "프로그램과 프로세스의 차이를 설명하시오." : "프로세스에 대한 설명으로 알맞은 것은?"}</p></div>` : ""}</div>`;
  const prefix = d.numbering === "글머리표 중심" ? "• " : "1. ";
  const sub =
    d.numbering === "1. → (1) → ①"
      ? "(1)"
      : d.numbering === "글머리표 중심"
        ? "◦"
        : "1)";
  return `<div class="dna-mini-note"><span class="dna-preview-caption">문체 예시 · ${esc(d.tone)}</span><h3>${prefix}프로세스 이해하기</h3>${d.headingStyle !== "간단하게 2단계" ? `<h4>${sub} 핵심 개념</h4>` : ""}${d.headingStyle === "자세하게 4단계" ? `<small>${d.numbering === "1. → (1) → ①" ? "①" : "a."} 프로그램과 프로세스</small>` : ""}<div class="dna-tone-preview">${styledTone(d)}</div>${d.layoutPreference !== "표 중심" ? "<ul><li>프로그램은 정적인 코드</li><li>프로세스는 실행 중인 상태</li></ul>" : ""}${d.layoutPreference !== "목록 중심" ? "<table><tr><th>프로그램</th><th>프로세스</th></tr><tr><td>정적</td><td>동적</td></tr></table>" : ""}${scope === "subject" ? `<div class="dna-run-summary"><strong>${esc(s.mode)} · 챕터 단위</strong><span>${esc(s.organization)}</span><span>예시 · ${esc(s.examplePreference)}</span>${s.hasMath ? `<span>수식 · ${esc(s.formula)}</span>` : ""}<span>용어 · ${esc(s.terminology)}</span><span>분량 · ${esc(s.length)}</span><span>PDF 밖 보강 · ${researchLabel(s.research)}</span><span>반영도 · PDF ${s.lectureWeight} / 교재 ${s.textbookWeight} / 필기 ${s.classWeight} / 교수 ${s.professorWeight}</span><span>시각자료 · ${esc(s.visuals)}</span></div>` : ""}</div>`;
}
function researchLabel(value) {
  return (
    {
      lecture: "없음",
      balanced: "부족한 내용만",
      deep: "적극적으로",
      academic: "학술자료로 심화",
    }[value] || "없음"
  );
}
function refreshScopedPreview() {
  ui.draft = structuredClone(dna(ui.dnaSubject));
  if ($("#dna-preview")) $("#dna-preview").innerHTML = scopedPreview(ui.draft);
  refreshRecommendations();
}
function handleScopedAction(action, el) {
  if (action === "finish-dna") {
    data.basicDNAReady = true;
    save();
    note() ? openNote(note().id) : navigate("home");
    return true;
  }
  if (action === "settings-scope") {
    ui.settingsScope = el.dataset.scope;
    render();
    return true;
  }
  if (action === "note-settings") {
    navigate("dna");
    ui.settingsScope = "subject";
    render();
    return true;
  }
  return false;
}
function applySubjectMode(target, mode) {
  const preset = modePresets[mode];
  if (!preset) return target;
  const next = { ...target, mode };
  for (const key of Object.keys(subjectDefaults))
    if (preset[key] !== undefined) next[key] = preset[key];
  return next;
}
function persistSettingControl(el) {
  const scope = el.dataset.settingScope,
    key = el.dataset.settingKey;
  const defaults =
    scope === "personal"
      ? personalDefaults
      : scope === "learning" || scope === "new-learning"
        ? learningDefaults
        : subjectDefaults;
  if (!(key in defaults) || (el.type === "radio" && !el.checked)) return;
  let value = el.type === "checkbox" ? el.checked : el.value;
  if (typeof defaults[key] === "number") {
    const v = Number(value);
    if (value === "" || !Number.isFinite(v)) return;
    value = Math.max(
      key === "classPriority" ? 1 : 0,
      Math.min(key === "questionCount" ? 100 : 3, Math.round(v)),
    );
    el.value = String(value);
  }
  if (scope === "personal")
    data.personalDNA = { ...personalSettings(), [key]: value };
  else if (scope === "subject" || scope === "new-subject") {
    let d = {
      ...(scope === "subject"
        ? subjectSettings(ui.dnaSubject)
        : ui.newSubjectDraft),
      [key]: value,
    };
    if (key === "mode") d = applySubjectMode(d, value);
    if (scope === "subject") {
      data.subjectDNA ||= {};
      data.subjectDNA[ui.dnaSubject] = d;
    } else ui.newSubjectDraft = d;
    syncSubjectControls(scope, d);
  } else if (scope === "learning") {
    data.learningDNA ||= {};
    data.learningDNA[ui.dnaSubject] = {
      ...learningSettings(ui.dnaSubject),
      [key]: value,
    };
  } else if (scope === "new-learning")
    ui.newLearningDraft = { ...ui.newLearningDraft, [key]: value };
  if (!scope.startsWith("new-")) {
    const ok = save(),
      status = $("#dna-save-state");
    if (status)
      status.innerHTML =
        icon(ok ? "check" : "clock") + (ok ? "저장됨" : "저장 공간 확인 필요");
    refreshScopedPreview();
  } else refreshCreationSummary();
}
function syncSubjectControls(scope, d) {
  for (const el of $$(`[data-setting-scope="${scope}"]`)) {
    const val = d[el.dataset.settingKey];
    if (el.type === "checkbox") el.checked = Boolean(val);
    else if (el.type === "radio") el.checked = el.value === val;
    else if (el.tagName === "SELECT") {
      const options = [...el.querySelectorAll("option")];
      for (const option of options) option.selected = false;
      const selected = options.find((option) => option.value === String(val));
      if (selected) selected.selected = true;
    } else if (String(el.value) !== String(val)) el.value = String(val);
  }
  const formula = $("#" + scope + "-formula");
  if (formula) formula.hidden = !d.hasMath;
  const hint = $("#" + scope + "-mode-hint");
  if (hint) hint.innerHTML = modeHint(d);
  const order = $("#" + scope + "-organization-help");
  if (order) order.textContent = organizationHelp(d.organization);
}
function availableNoteSources(n = note(), isNew = false) {
  return [
    ...(isNew
      ? ui.upload
        ? [{ id: "material", name: ui.upload.name }]
        : []
      : n?.file
        ? [{ id: "material", name: n.file }]
        : []),
    ...(isNew
      ? []
      : classAttachments(n).map((a) => ({ id: a.id, name: a.name }))),
  ];
}
function noteFields() {
  return creationSummary();
}
function creationSummary() {
  const subject = $("#upload-subject")?.value || note()?.subject || "운영체제";
  const s = subject === "__new" ? ui.newSubjectDraft : subjectSettings(subject),
    l = subject === "__new" ? ui.newLearningDraft : learningSettings(subject);
  return `<div class="dna-creation-summary"><span>${icon("dna")}과목의 DNA를 가져와요</span><strong>${esc(s.mode)} · ${esc(s.length)}</strong><small>${l.questionCount ? `${l.problemTypes.map(esc).join(" · ")} / ${l.questionCount}개 / ${esc(l.chapterMode)}` : "문제 생성 안 함"}</small></div>`;
}
function refreshCreationSummary() {
  if ($("#new-note-options"))
    $("#new-note-options").innerHTML = creationSummary();
}
function updateConditionalSettings() {
  refreshCreationSummary();
}
function refreshNewNoteSources() {}
function noteSettingsEntry(n) {
  const s = subjectSettings(n.subject);
  return `<button class="note-settings-entry" data-action="note-settings">${icon("dna")}<span>${esc(s.mode)}<small> · ${esc(s.length)}</small></span><span class="note-settings-edit">과목별 DNA ${icon("right")}</span></button>`;
}
function allowedClassSource(a, n) {
  const r = noteSettings(n);
  if (r.sourceMode === "selected") return r.sourceIds.includes(a.id);
  if (r.sourceMode === "new")
    return (
      !n.classSyncAt || String(a.updatedAt || a.createdAt || "") > n.classSyncAt
    );
  return true;
}
function applyScopedTemplate(subject, t, keys) {
  const s = subjectSettings(subject);
  if (keys.includes("density"))
    s.length = ["핵심만 간단히", "적당한 분량", "최대한 자세히"][t.density - 1];
  if (keys.includes("formula"))
    s.formula =
      {
        수식만: "결과만 표시",
        "수식 + 설명": "의미와 사용법 설명",
        "자세한 풀이": "유도 과정과 계산 예시",
      }[t.formula] || s.formula;
  if (keys.includes("difficulty"))
    s.terminology =
      t.difficulty === "원문 유지"
        ? "핵심 용어만"
        : "모든 전문용어를 자세히 설명";
  if (keys.includes("formats"))
    data.personalDNA = {
      ...personalSettings(),
      layoutPreference:
        t.formats.includes("표") && t.formats.includes("글머리표")
          ? "표와 목록을 적절히 혼합"
          : t.formats.includes("표")
            ? "표 중심"
            : "목록 중심",
    };
  data.subjectDNA ||= {};
  data.subjectDNA[subject] = s;
}
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "settings-subject") {
    ui.dnaSubject = el.value;
    render();
    return;
  }
  if (el.dataset.settingScope) persistSettingControl(el);
  if (el.dataset.learningType) {
    const scope = el.dataset.learningType,
      d =
        scope === "new-learning"
          ? ui.newLearningDraft
          : learningSettings(ui.dnaSubject);
    const next = el.checked
      ? [...new Set([...d.problemTypes, el.value])]
      : d.problemTypes.filter((t) => t !== el.value);
    if (!next.length) {
      el.checked = true;
      toast("문제 유형을 하나 이상 선택해 주세요.");
      return;
    }
    d.problemTypes = next;
    if (scope === "new-learning") {
      ui.newLearningDraft = d;
      refreshCreationSummary();
    } else {
      data.learningDNA ||= {};
      data.learningDNA[ui.dnaSubject] = d;
      save();
      refreshScopedPreview();
    }
  }
});
document.addEventListener("input", (e) => {
  if (
    e.target.matches(
      'input:not([type])[data-setting-scope],input[type="text"][data-setting-scope]',
    )
  )
    persistSettingControl(e.target);
});
function attachmentSourceControls() {
  const n = note(),
    r = noteSettings(n),
    sources = availableNoteSources(n);
  if (sources.length < 2) return "";
  return advancedSettings(
    "정리에 사용할 자료",
    `<label class="dna-field"><span>자료 선택</span><select id="attachment-source-mode">${[
      ["all", "모든 자료 사용"],
      ["selected", "선택한 자료만 사용"],
      ["new", "새로 추가한 자료만 사용"],
    ]
      .map(
        ([v, t]) =>
          `<option value="${v}" ${r.sourceMode === v ? "selected" : ""}>${t}</option>`,
      )
      .join(
        "",
      )}</select></label><div id="attachment-source-items" ${r.sourceMode === "selected" ? "" : "hidden"}>${sources.map((a) => `<label class="check-row"><input type="checkbox" data-attachment-source="${esc(a.id)}" ${r.sourceIds.includes(a.id) ? "checked" : ""}>${esc(a.name)}</label>`).join("")}</div>`,
  );
}
document.addEventListener("change", (e) => {
  const el = e.target,
    n = note();
  if (!n) return;
  if (el.id === "attachment-source-mode") {
    n.runSettings = { ...n.runSettings, sourceMode: el.value };
    $("#attachment-source-items").hidden = el.value !== "selected";
    save();
  }
  if (el.dataset.attachmentSource) {
    const ids = noteSettings(n).sourceIds;
    n.runSettings = {
      ...n.runSettings,
      sourceIds: el.checked
        ? [...new Set([...ids, el.dataset.attachmentSource])]
        : ids.filter((id) => id !== el.dataset.attachmentSource),
    };
    save();
  }
});
