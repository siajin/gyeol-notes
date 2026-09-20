"use strict";
// Defaults and storage scopes match the Note DNA product settings.
const personalDefaults = {
  organization: "이해하기 좋은 흐름으로",
  headingStyle: "일반적인 3단계",
  numbering: "1. → 1) → a.",
  layoutPreference: "표와 목록을 적절히 혼합",
  emphasis: "핵심만 강조",
  tone: "쉽고 친근하게",
  density: 2,
  examplePreference: "개념별 예시 2개",
  learn: true,
};
const subjectDefaults = {
  hasMath: true,
  formula: "의미와 사용법 설명",
  terminology: "처음 등장할 때 설명",
  materialMode: "모든 자료를 균형 있게",
  lectureWeight: 2,
  textbookWeight: 2,
  classWeight: 2,
  professorWeight: 2,
  academicWeight: 2,
  visuals: "AI가 자동 선택",
  visualFrequency: "필요한 경우에만",
  problemType: "AI가 혼합 출제",
  questionDifficulty: "강의 수준",
  questionCount: 5,
  answerDetail: "간단한 해설",
  examEmphasis: "학습과 시험을 균형 있게",
  research: "balanced",
  classPriority: 2,
  classEmphasis: true,
};
const noteDefaults = {
  mode: "개념 이해",
  scopeMode: "업로드한 자료 전체",
  pageRange: "",
  examRange: "",
  length: "적당한 분량",
  sourceMode: "all",
  sourceIds: [],
  problemGeneration: "mode",
  problemCountChoice: "dna",
  problemCount: 5,
  problemDifficulty: "dna",
  prompt: "",
  difficultyOverride: "현재 수준 유지",
};
const personalOptions = {
  organization: [
    "강의자료 순서대로",
    "핵심 개념·키워드별",
    "이해하기 좋은 흐름으로",
  ],
  headingStyle: ["간단하게 2단계", "일반적인 3단계", "자세하게 4단계"],
  numbering: ["1. → 1) → a.", "1. → (1) → ①", "글머리표 중심"],
  layoutPreference: ["목록 중심", "표와 목록을 적절히 혼합", "표 중심"],
  emphasis: ["최소한으로", "핵심만 강조", "시험 중요 내용까지 적극 강조"],
  tone: ["짧고 간결하게", "쉽고 친근하게", "교재처럼 공식적으로"],
  density: [
    [1, "기초부터 쉽게"],
    [2, "강의 이해 수준"],
    [3, "전공 심화 수준"],
  ],
  examplePreference: [
    "핵심 예시 1개",
    "개념별 예시 2개",
    "다양한 예시 3개 이상",
  ],
};
const modePresets = {
  "개념 이해": {
    questions: false,
    terms: "모든 전문용어를 자세히 설명",
    visuals: "마인드맵·개념도",
    tape: false,
    description: "쉬운 용어 · 선수 개념 · 핵심 예시 · 개념 관계도",
    detail: "문제는 기본적으로 생성하지 않아요.",
  },
  "심화 학습": {
    questions: true,
    research: "academic",
    formula: "유도 과정과 계산 예시",
    questionDifficulty: "심화",
    tape: false,
    description: "원리와 배경 · 학술자료 · 수식 유도 · 개념 연결",
    detail: "심화문제와 응용 사례를 포함해요.",
  },
  "시험 대비": {
    questions: true,
    materialMode: "교수 설명·개인 필기 중심",
    examEmphasis: "시험 중요 내용 적극 강조",
    questionDifficulty: "시험 수준",
    tape: true,
    description: "교수 강조 · 개인 필기 · 예상문제 · 정답과 해설",
    detail: "암기할 내용을 가리는 복습 테이프를 포함해요.",
  },
  "A+ 종합 노트": {
    questions: true,
    research: "academic",
    materialMode: "교수 설명·개인 필기 중심",
    visuals: "마인드맵·개념도",
    answerDetail: "상세한 해설",
    tape: true,
    description: "개념과 심화 · 학술자료 · 구조도 · 예상문제",
    detail: "상세 해설과 능동 복습용 테이프를 포함해요.",
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
  if (data.settingsVersion === 3) return;
  try {
    data.basicDNAReady = Boolean(localStorage.getItem(KEY));
  } catch {
    data.basicDNAReady = false;
  }
  const legacy = { ...defaultDNA, ...data.dna.기본 };
  data.personalDNA = pickSettings(
    {
      ...personalDefaults,
      ...(data.dna.기본?.density ? { density: legacy.density } : {}),
      ...(data.dna.기본?.learn !== undefined ? { learn: legacy.learn } : {}),
      layoutPreference:
        legacy.formats?.includes("표") && !legacy.formats?.includes("글머리표")
          ? "표 중심"
          : !legacy.formats?.includes("표")
            ? "목록 중심"
            : personalDefaults.layoutPreference,
      emphasis:
        legacy.bold === false ? "최소한으로" : personalDefaults.emphasis,
    },
    personalDefaults,
  );
  data.subjectDNA = {};
  data.personalOverrides = {};
  const formulaMap = {
    수식만: "결과만 표시",
    "수식 + 설명": "의미와 사용법 설명",
    "자세한 풀이": "유도 과정과 계산 예시",
  };
  for (const subject of new Set([
    ...Object.keys(data.dna),
    ...data.notes.map((n) => n.subject),
  ])) {
    const old = data.dna[subject] || {};
    data.subjectDNA[subject] = {
      ...structuredClone(subjectDefaults),
      formula: formulaMap[old.formula] || subjectDefaults.formula,
      research: old.research || subjectDefaults.research,
      classPriority: old.classPriority || 2,
      classEmphasis: old.classEmphasis ?? true,
    };
    if (old.classWeight !== undefined && old.classWeight !== 2) {
      data.subjectDNA[subject].materialMode = "직접 조정";
      data.subjectDNA[subject].classWeight = old.classWeight;
    }
    // Preserve previous subject-specific preferences as explicit overrides.
    const overrides = {};
    if (old.density !== undefined && old.density !== legacy.density)
      overrides.density = old.density;
    if (
      old.formats &&
      JSON.stringify(old.formats) !== JSON.stringify(legacy.formats)
    )
      overrides.layoutPreference =
        old.formats.includes("표") && !old.formats.includes("글머리표")
          ? "표 중심"
          : !old.formats.includes("표")
            ? "목록 중심"
            : personalDefaults.layoutPreference;
    if (old.bold === false) overrides.emphasis = "최소한으로";
    if (Object.keys(overrides).length)
      data.personalOverrides[subject] = overrides;
  }
  for (const n of data.notes)
    n.runSettings = {
      ...structuredClone(noteDefaults),
      prompt: data.dna[n.subject]?.prompt || "",
    };
  data.settingsVersion = 3;
}
function personalSettings() {
  return { ...personalDefaults, ...data.personalDNA };
}
function subjectSettings(subject) {
  return {
    ...subjectDefaults,
    ...data.subjectDNA?.기본,
    ...data.subjectDNA?.[subject],
  };
}
function personalForSubject(subject) {
  return { ...personalSettings(), ...data.personalOverrides?.[subject] };
}
function noteSettings(n = note()) {
  const r = { ...structuredClone(noteDefaults), ...n?.runSettings };
  const sources = availableNoteSources(n);
  r.sourceIds = r.sourceIds.filter((id) => sources.some((s) => s.id === id));
  if (sources.length < 2) {
    r.sourceMode = "all";
    r.sourceIds = [];
  }
  return r;
}
function deriveDNA(personal, subject) {
  const weights = materialWeights(subject);
  return {
    ...personal,
    ...subject,
    ...weights,
    formats:
      personal.layoutPreference === "표 중심"
        ? ["표"]
        : personal.layoutPreference === "목록 중심"
          ? ["글머리표"]
          : ["글머리표", "표"],
    bold: personal.emphasis !== "최소한으로",
    star:
      personal.emphasis === "시험 중요 내용까지 적극 강조" ||
      subject.examEmphasis === "시험 중요 내용 적극 강조",
    examples: true,
    difficulty:
      personal.density === 1
        ? "쉽게 풀어서"
        : personal.density === 3
          ? "원문 유지"
          : "예시까지",
    prompt: "",
  };
}
function materialWeights(s) {
  if (s.materialMode === "강의자료·교재 중심")
    return {
      lectureWeight: 3,
      textbookWeight: 3,
      classWeight: 1,
      professorWeight: 1,
      academicWeight: 1,
    };
  if (s.materialMode === "교수 설명·개인 필기 중심")
    return {
      lectureWeight: 2,
      textbookWeight: 1,
      classWeight: 3,
      professorWeight: 3,
      academicWeight: 1,
    };
  if (s.materialMode === "모든 자료를 균형 있게")
    return {
      lectureWeight: 2,
      textbookWeight: 2,
      classWeight: 2,
      professorWeight: 2,
      academicWeight: 2,
    };
  return Object.fromEntries(
    [
      "lectureWeight",
      "textbookWeight",
      "classWeight",
      "professorWeight",
      "academicWeight",
    ].map((k) => [k, s[k]]),
  );
}
function commitScopedDraft() {
  // Each control persists to its own scope; a merged preview must never overwrite inheritance.
  if (!ui.draft) return;
}
function effectiveNoteDNA(
  n = note(),
  d = dna(n?.subject),
  r = noteSettings(n),
) {
  const preset = modePresets[r.mode] || modePresets["개념 이해"];
  const result = {
    ...d,
    prompt: r.prompt,
    length: r.length,
    mode: r.mode,
    tape: preset.tape,
  };
  for (const key of [
    "research",
    "formula",
    "materialMode",
    "examEmphasis",
    "visuals",
    "answerDetail",
  ])
    if (preset[key]) result[key] = preset[key];
  if (preset.terms) result.terminology = preset.terms;
  Object.assign(result, materialWeights(result));
  if (r.difficultyOverride === "더 쉽게")
    Object.assign(result, {
      density: Math.max(1, d.density - 1),
      formula: "의미와 사용법 설명",
      terminology: "모든 전문용어를 자세히 설명",
      difficulty: "쉽게 풀어서",
    });
  if (r.difficultyOverride === "한 단계 심화")
    Object.assign(result, {
      density: Math.min(3, d.density + 1),
      formula: "유도 과정과 계산 예시",
      difficulty: "원문 유지",
    });
  if (r.difficultyOverride === "전공 심화")
    Object.assign(result, {
      density: 3,
      formula: "유도 과정과 계산 예시",
      terminology: "핵심 용어만",
      difficulty: "원문 유지",
    });
  if (!d.hasMath || d.formula === "수식 거의 없음")
    result.formula = "수식 거의 없음";
  if (d.visuals === "생성하지 않음") result.visuals = "생성하지 않음";
  result.generateQuestions =
    r.problemGeneration === "yes" ||
    (r.problemGeneration === "mode" &&
      preset.questions &&
      d.problemType !== "생성하지 않음");
  const count =
    r.problemCountChoice === "dna"
      ? d.questionCount
      : r.problemCountChoice === "custom"
        ? r.problemCount
        : Number(r.problemCountChoice);
  result.problemCount = result.generateQuestions ? count : 0;
  result.problemDifficulty =
    r.problemDifficulty === "dna"
      ? preset.questionDifficulty || d.questionDifficulty
      : r.problemDifficulty;
  if (r.sourceMode !== "all") result.research = "lecture";
  result.bold =
    result.bold || result.examEmphasis === "시험 중요 내용 적극 강조";
  result.star = result.examEmphasis === "시험 중요 내용 적극 강조";
  return result;
}
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
function personalFields(d, scope = "personal") {
  const select = (key, label) =>
    scopeSelect(scope, key, label, personalOptions[key], d[key]);
  return `<div class="dna-form-grid">${select("organization", "정리 기준")}${select("layoutPreference", "표와 목록")}${select("emphasis", "강조 방식")}${select("tone", "문체")}${select("density", "기본 설명 수준")}</div><p class="dna-inline-help" id="organization-help">${organizationHelp(d.organization)}</p>${advancedSettings("세부 설정", `<p class="settings-help">제목, 번호와 예시는 추천값으로 시작해요.</p><div class="dna-form-grid">${select("headingStyle", "제목 구조")}${select("numbering", "번호 표기")}${select("examplePreference", "예시 선호도")}</div>`)}`;
}
function organizationHelp(value) {
  return value === "강의자료 순서대로"
    ? "PDF 페이지와 PPT 슬라이드 순서를 유지해요."
    : value === "핵심 개념·키워드별"
      ? "여러 페이지에 흩어진 내용을 같은 개념끼리 모아요."
      : "선수 개념부터 응용 내용까지 이해하기 좋은 순서로 정리해요.";
}
function subjectFields(d, scope = "subject") {
  const select = (key, label, options, help = "") =>
    scopeSelect(scope, key, label, options, d[key], help);
  const material = select("materialMode", "자료 반영 방식", [
    "강의자료·교재 중심",
    "모든 자료를 균형 있게",
    "교수 설명·개인 필기 중심",
    "직접 조정",
  ]);
  return `<div class="dna-form-grid">${material}<div id="${scope}-formula" ${d.hasMath ? "" : "hidden"}>${select("formula", "수식 설명 수준", ["결과만 표시", "의미와 사용법 설명", "유도 과정과 계산 예시", "수식 거의 없음"])}</div>${select("examEmphasis", "시험 관련 강조", ["학습 내용 중심", "학습과 시험을 균형 있게", "시험 중요 내용 적극 강조"])}${select(
    "research",
    "외부 자료 보강",
    [
      ["lecture", "사용하지 않음"],
      ["balanced", "부족한 내용만 보강"],
      ["deep", "적극적으로 보강"],
      ["academic", "학술자료로 심화 보강"],
    ],
  )}</div><div id="${scope}-weights" ${d.materialMode === "직접 조정" ? "" : "hidden"} class="dna-conditional"><span class="dna-subheading">자료별 반영도</span><div class="dna-form-grid">${[
    ["lectureWeight", "강의자료"],
    ["textbookWeight", "교재"],
    ["classWeight", "개인 필기"],
    ["professorWeight", "교수 설명"],
    ["academicWeight", "외부 학술자료"],
  ]
    .map(([k, l]) =>
      select(k, l, [
        [1, "낮게"],
        [2, "보통"],
        [3, "높게"],
      ]),
    )
    .join("")}</div></div>${advancedSettings(
    "추가 학습 설정",
    `<label class="check-row"><input type="checkbox" data-setting-scope="${scope}" data-setting-key="hasMath" ${d.hasMath ? "checked" : ""}>수식이 있는 과목이에요</label><div class="dna-form-grid">${select("terminology", "용어 설명 수준", ["핵심 용어만", "처음 등장할 때 설명", "모든 전문용어를 자세히 설명"])}${select("visuals", "시각자료 종류", ["AI가 자동 선택", "마인드맵·개념도", "흐름도·구조도", "표·비교표", "생성하지 않음"])}</div><div id="${scope}-visual-options" ${d.visuals === "생성하지 않음" ? "hidden" : ""} class="dna-conditional">${select("visualFrequency", "시각자료 생성 빈도", ["단원마다 1개", "필요한 경우에만", "사용자가 요청할 때만"])}</div>${select("problemType", "문제 유형", ["AI가 혼합 출제", "객관식 중심", "주관식·서술형 중심", "계산·응용 중심", "생성하지 않음"])}<div id="${scope}-question-options" ${d.problemType === "생성하지 않음" ? "hidden" : ""} class="dna-conditional"><div class="dna-form-grid">${select("questionDifficulty", "기본 문제 난이도", ["기초", "강의 수준", "시험 수준", "심화"])}${select(
      "questionCount",
      "기본 문제 개수",
      [
        [5, "5개"],
        [10, "10개"],
        [15, "15개"],
      ],
    )}${select("answerDetail", "해설", ["정답만", "간단한 해설", "상세한 해설"])}</div></div><div class="dna-form-grid">${select(
      "classPriority",
      "개인 필기의 중요도",
      [
        [1, "참고"],
        [2, "중요"],
        [3, "최우선"],
      ],
    )}</div><label class="check-row"><input type="checkbox" data-setting-scope="${scope}" data-setting-key="classEmphasis" ${d.classEmphasis ? "checked" : ""}>개인 필기에서 강조한 구절 먼저 반영</label>`,
  )}${
    scope === "subject"
      ? advancedSettings(
          "이 과목의 기본 DNA 조정",
          `<p class="settings-help">기본 DNA를 그대로 가져옵니다. 필요한 항목만 이 과목에서 바꿀 수 있어요.</p>${btn("기본 DNA로 되돌리기", "reset-subject-personal", "btn ghost")}<div class="dna-form-grid">${Object.keys(
            personalOptions,
          )
            .map((k) =>
              scopeSelect(
                "subject-personal",
                k,
                {
                  organization: "정리 기준",
                  headingStyle: "제목 구조",
                  numbering: "번호 표기",
                  layoutPreference: "표와 목록",
                  emphasis: "강조 방식",
                  tone: "문체",
                  density: "기본 설명 수준",
                  examplePreference: "예시 선호도",
                }[k],
                [["inherit", "기본 DNA 따르기"], ...personalOptions[k]],
                data.personalOverrides?.[ui.dnaSubject]?.[k] ?? "inherit",
              ),
            )
            .join("")}</div>`,
        )
      : ""
  }`;
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
function noteFields(r, n = note(), isNew = false) {
  const scope = isNew ? "new-note" : "note",
    d = isNew
      ? deriveDNA(
          personalSettings(),
          ui.newSubjectDraft || subjectSettings(note()?.subject),
        )
      : dna(n?.subject);
  const select = (key, label, options, help = "") =>
    scopeSelect(scope, key, label, options, r[key], help);
  const sources = availableNoteSources(n, isNew),
    effective = effectiveNoteDNA(n, d, r);
  return `<fieldset class="dna-modes"><legend>학습 모드</legend><div class="dna-mode-options">${Object.keys(
    modePresets,
  )
    .map(
      (value) =>
        `<label><input type="radio" name="${scope}-mode" data-setting-scope="${scope}" data-setting-key="mode" value="${value}" ${r.mode === value ? "checked" : ""}><span><strong>${value}</strong></span></label>`,
    )
    .join(
      "",
    )}</div></fieldset><div id="${scope}-mode-hint" class="dna-mode-hint">${modeHint(r)}</div><div class="dna-form-grid">${select("scopeMode", "학습 범위", ["업로드한 자료 전체", "단원·페이지 선택", "시험 범위 직접 입력"])}${select("length", "노트 분량", ["핵심만 간단히", "적당한 분량", "최대한 자세히"])}</div><label class="dna-field dna-conditional" id="${scope}-page-range" ${r.scopeMode === "단원·페이지 선택" ? "" : "hidden"}><span>단원·페이지</span><input data-setting-scope="${scope}" data-setting-key="pageRange" maxlength="200" value="${esc(r.pageRange)}" placeholder="예: 2장, 12–35페이지"></label><label class="dna-field dna-conditional" id="${scope}-exam-range" ${r.scopeMode === "시험 범위 직접 입력" ? "" : "hidden"}><span>이번 시험 범위</span><input data-setting-scope="${scope}" data-setting-key="examRange" maxlength="200" value="${esc(r.examRange)}" placeholder="예: 중간고사 3–7주차"></label>${advancedSettings(
    "추가 설정",
    `<div id="${scope}-source-control" ${sources.length > 1 ? "" : "hidden"}>${select(
      "sourceMode",
      "사용할 자료",
      [
        ["all", "모든 자료 사용"],
        ["selected", "선택한 자료만 사용"],
        ["new", "새로 추가한 자료만 사용"],
      ],
    )}</div><div id="${scope}-sources" class="dna-source-list" ${r.sourceMode === "selected" ? "" : "hidden"}>${sourceCheckboxes(sources, r, scope)}</div><div class="dna-form-grid">${select(
      "problemGeneration",
      "문제 생성",
      [
        ["mode", "학습 모드 권장값 사용"],
        ["yes", "생성하기"],
        ["no", "생성하지 않음"],
      ],
    )}${select("difficultyOverride", "전체 난이도 변경", ["현재 수준 유지", "더 쉽게", "한 단계 심화", "전공 심화"])}</div><div id="${scope}-question-options" ${effective.generateQuestions ? "" : "hidden"} class="dna-conditional"><div class="dna-form-grid">${select(
      "problemCountChoice",
      "문제 개수",
      [
        ["dna", "과목별 DNA 사용"],
        ["0", "생성하지 않음"],
        ["5", "5개"],
        ["10", "10개"],
        ["custom", "직접 입력"],
      ],
    )}<div id="${scope}-difficulty-control" ${effective.problemCount ? "" : "hidden"}>${select("problemDifficulty", "문제 난이도", [["dna", "학습 모드·DNA 사용"], "기초", "강의 수준", "시험 수준", "혼합"])}</div><label class="dna-field" id="${scope}-custom-count" ${r.problemCountChoice === "custom" ? "" : "hidden"}><span>직접 입력 · 문제 개수</span><input type="number" min="1" max="100" step="1" data-setting-scope="${scope}" data-setting-key="problemCount" value="${r.problemCount}"></label></div></div><label class="dna-field full"><span>자유 요청문</span><textarea rows="3" maxlength="300" data-setting-scope="${scope}" data-setting-key="prompt" placeholder="교수님이 강조한 내용 위주로 정리해줘.">${esc(r.prompt)}</textarea><small>이번 노트에만 적용 · 최대 300자</small></label><details class="dna-prompt-examples"><summary>요청문 예시 보기</summary><ul>${["교수님이 강조한 내용 위주로 정리해줘.", "수식마다 계산 예시를 하나씩 추가해줘.", "중간고사 범위에서 출제 가능성이 높은 부분을 표시해줘.", "비슷한 개념은 비교표로 만들어줘.", "기초 설명은 줄이고 응용 내용을 자세히 설명해줘."].map((v) => `<li>${v}</li>`).join("")}</ul></details>`,
  )}`;
}
function modeHint(r) {
  const p = modePresets[r.mode] || modePresets["개념 이해"];
  return `<strong>${p.description}</strong><span>${p.detail}</span>`;
}
function sourceCheckboxes(sources, r, scope) {
  return `${sources.map((s) => `<label class="check-row"><input type="checkbox" data-source-scope="${scope}" value="${esc(s.id)}" ${r.sourceIds.includes(s.id) ? "checked" : ""}>${esc(s.name)}</label>`).join("")}<small>선택한 자료만 사용하며 외부 자료 보강은 제외합니다.</small><p class="source-selection-status" role="status">${r.sourceIds.length ? "" : "사용할 자료를 하나 이상 선택해 주세요."}</p>`;
}
function scopedSettingsPage() {
  const scope = ui.settingsScope || "personal";
  const d =
    scope === "personal"
      ? deriveDNA(personalSettings(), subjectSettings(ui.dnaSubject))
      : dna(scope === "note" ? note()?.subject : ui.dnaSubject);
  ui.draft = structuredClone(d);
  const scopes = [
    ["personal", "기본 DNA", "모든 과목의 기본값"],
    ["subject", "과목별 DNA", "필요한 부분만 조정"],
    ["note", "이번 노트", "한 번만 적용"],
  ];
  const captions = {
    personal: "처음에는 5가지만 정하세요. 세부 설정은 추천값으로 채워드려요.",
    subject: "이 과목에 필요한 4가지만 먼저 정하세요.",
    note: "목적, 범위, 분량만 선택하면 준비 끝. 나머지는 DNA를 따라요.",
  };
  const subjects = [
    ...new Set([
      "운영체제",
      "알고리즘",
      "선형대수",
      ...data.notes.map((n) => n.subject),
      ui.dnaSubject,
    ]),
  ];
  return `<section class="page dna-settings"><header class="page-header"><div><span class="dna-eyebrow">NOTE DNA</span><h1>나에게 맞는 정리</h1><p>평소 취향은 한 번만, 필요한 설정은 그때그때.</p></div><span class="dna-autosave" id="dna-save-state" role="status">${icon("check")} 자동 저장</span></header><nav class="dna-scope-tabs" aria-label="설정 적용 범위">${scopes.map(([key, title, sub]) => btn(`<strong>${title}</strong><small>${sub}</small>`, "settings-scope", key === scope ? "active" : "", `data-scope="${key}" aria-current="${key === scope ? "page" : "false"}"`)).join("")}</nav><div class="dna-settings-layout"><div class="dna-settings-main"><div class="dna-scope-heading"><div><h2>${scopes.find((s) => s[0] === scope)[1]}</h2><p>${captions[scope]}</p></div>${scope === "subject" ? `<label class="dna-subject-picker"><span class="sr-only">설정할 과목</span><select id="settings-subject">${subjects.map((s) => `<option ${s === ui.dnaSubject ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>` : ""}</div>${scope === "note" ? (note() ? `<div class="dna-note-target">${icon("file")}<span>${esc(note().title)}</span></div>${noteFields(noteSettings())}` : `<div class="empty-state"><p>노트를 만든 뒤 이번 노트 설정을 조절할 수 있어요.</p>${btn("새 노트", "upload", "btn primary")}</div>`) : scope === "subject" ? subjectFields(subjectSettings(ui.dnaSubject)) : personalFields(d)}${scope === "personal" && !data.basicDNAReady ? `<div class="dna-onboarding-finish">${btn("이 설정으로 시작하기" + icon("arrow"), "finish-dna", "btn primary")}</div>` : ""}<p class="dna-scope-foot">${icon("lock")}${scope === "personal" ? "새 과목에도 이 기본값을 가져옵니다." : scope === "subject" ? esc(ui.dnaSubject) + " 과목에만 저장됩니다." : "이 설정은 다음 노트로 이어지지 않습니다."}</p>${scope === "note" && note() ? `<div class="dna-habit-wrap">${habitPanel(note().subject, d)}</div>` : ""}</div><aside class="dna-settings-aside"><div class="dna-preview-card"><div class="preview-label">${icon("file")} 설정 미리보기</div><div id="dna-preview">${scopedPreview(d, noteSettings())}</div><p class="dna-preview-help">설정에 따른 예시입니다. 기존 본문은 유지됩니다. AI 정리·문제·시각자료·복습 테이프 생성은 연결 후 제공됩니다.</p></div></aside></div></section>`;
}
function scopedPreview(d, r) {
  const isNote = ui.settingsScope === "note",
    a = isNote ? effectiveNoteDNA(note(), d, r) : d;
  const levels = ["기초부터 쉽게", "강의 이해 수준", "전공 심화 수준"];
  let explanation = [
    "지금 필요한 정보만 메모리에 가져와요. 책장에서 읽을 책만 꺼내 두는 것과 비슷해요.",
    "필요한 페이지만 메모리에 적재하고, 없는 페이지는 페이지 폴트를 통해 가져와요.",
    "페이지 부재 시 예외 처리로 제어를 넘기고, 유효성 검사와 프레임 할당 후 페이지 테이블을 갱신해요.",
  ][a.density - 1];
  if (d.tone === "짧고 간결하게")
    explanation = explanation
      .replaceAll("가져와요.", "가져오기.")
      .replaceAll("비슷해요.", "유사.")
      .replaceAll("갱신해요.", "갱신.");
  if (d.tone === "교재처럼 공식적으로")
    explanation = explanation
      .replaceAll("가져와요.", "가져온다.")
      .replaceAll("비슷해요.", "유사하다.")
      .replaceAll("갱신해요.", "갱신한다.");
  const heading = d.numbering === "글머리표 중심" ? "• " : "1. ";
  const title =
    d.organization === "핵심 개념·키워드별"
      ? "가상 메모리의 핵심 개념"
      : d.organization === "강의자료 순서대로"
        ? "강의 07 · 요구 페이징"
        : "요구 페이징 이해하기";
  const table =
    "<table><tr><th>개념</th><th>핵심</th></tr><tr><td>페이지 폴트</td><td>없는 페이지 가져오기</td></tr></table>";
  const list =
    "<ul><li>필요한 페이지부터 적재</li><li>없으면 페이지 폴트 처리</li></ul>";
  const examples =
    d.examplePreference === "핵심 예시 1개"
      ? 1
      : d.examplePreference === "개념별 예시 2개"
        ? 2
        : 3;
  return `<div class="dna-mini-note"><span class="dna-preview-caption">운영체제 내용 예시 · ${levels[a.density - 1]}</span><h3>${heading}${title}</h3>${d.headingStyle !== "간단하게 2단계" ? `<h4>${d.numbering === "1. → (1) → ①" ? "(1)" : d.numbering === "글머리표 중심" ? "◦" : "1)"} 동작 방식</h4>` : ""}${d.headingStyle === "자세하게 4단계" ? `<small>${d.numbering === "1. → (1) → ①" ? "①" : "a."} 메모리 접근</small>` : ""}<p class="preview-emphasis ${d.emphasis !== "최소한으로" ? "is-bold" : ""}">${explanation}</p>${d.layoutPreference === "표 중심" ? table : d.layoutPreference === "목록 중심" ? list : list + table}<p class="dna-example">${["예: 지금 읽는 책만 책상에 꺼내 두기.", "예: 100페이지 중 필요한 3페이지만 적재.", "예: 읽지 않던 페이지는 필요해지면 가져오기."].slice(0, examples).join("<br>")}</p>${d.emphasis === "시험 중요 내용까지 적극 강조" ? '<p class="is-highlight">시험 포인트 · 페이지 폴트 처리 순서</p>' : ""}${ui.settingsScope === "subject" || isNote ? `<div class="dna-effective">${a.hasMath ? `<span>수식 · ${esc(a.formula)}</span>` : ""}<span>용어 · ${esc(a.terminology)}</span><span>자료 · ${esc(a.materialMode)}</span><span>시각자료 · ${esc(a.visuals)}${a.visuals !== "생성하지 않음" ? " / " + esc(a.visualFrequency) : ""}</span><span>문제 · ${esc(a.problemType)}</span><span>시험 · ${esc(a.examEmphasis)}</span><span>외부 자료 · ${researchLabel(a.research)}</span></div>` : ""}${isNote ? `<div class="dna-run-summary"><strong>${esc(r.mode)}</strong><span>${esc(r.scopeMode)}${r.scopeMode === "단원·페이지 선택" ? " · " + esc(r.pageRange) : r.scopeMode === "시험 범위 직접 입력" ? " · " + esc(r.examRange) : ""}</span><span>${esc(r.length)} · ${a.problemCount ? `${a.problemCount}문제 / ${esc(a.problemDifficulty)} / ${esc(a.answerDetail)}` : "문제 생성 안 함"}</span><span>난이도 · ${esc(r.difficultyOverride)}</span><span>복습 테이프 · ${a.tape ? "포함" : "사용 안 함"}</span><span>${r.sourceMode === "selected" ? `선택한 자료 ${r.sourceIds.length}개` : r.sourceMode === "new" ? "새로 추가한 자료만" : "모든 자료 사용"}</span>${r.prompt ? `<p>${esc(r.prompt)}</p>` : ""}</div>` : ""}</div>`;
}
function researchLabel(value) {
  return (
    {
      lecture: "사용하지 않음",
      balanced: "부족한 내용만 보강",
      deep: "적극적으로 보강",
      academic: "학술자료로 심화 보강",
    }[value] || "부족한 내용만 보강"
  );
}
function refreshScopedPreview() {
  const scope = ui.settingsScope || "personal";
  ui.draft =
    scope === "personal"
      ? deriveDNA(personalSettings(), subjectSettings(ui.dnaSubject))
      : dna(scope === "note" ? note()?.subject : ui.dnaSubject);
  if ($("#dna-preview"))
    $("#dna-preview").innerHTML = scopedPreview(ui.draft, noteSettings());
  refreshRecommendations();
}
function handleScopedAction(action, el) {
  if (action === "finish-dna") {
    data.basicDNAReady = true;
    save();
    if (note()) openNote(note().id);
    else navigate("home");
    return true;
  }
  if (action === "settings-scope") {
    save();
    ui.settingsScope = el.dataset.scope;
    if (ui.settingsScope === "note")
      ui.dnaSubject = note()?.subject || ui.dnaSubject;
    render();
    return true;
  }
  if (action === "note-settings") {
    navigate("dna");
    ui.settingsScope = "note";
    render();
    return true;
  }
  if (action === "reset-subject-personal") {
    delete data.personalOverrides[ui.dnaSubject];
    save();
    render();
    toast("이 과목은 기본 DNA를 그대로 따릅니다.");
    return true;
  }
  return false;
}
function persistSettingControl(el) {
  const scope = el.dataset.settingScope,
    key = el.dataset.settingKey;
  const defaults =
    scope === "personal" || scope === "subject-personal"
      ? personalDefaults
      : scope === "subject" || scope === "new-subject"
        ? subjectDefaults
        : noteDefaults;
  if (!scope || !(key in defaults) || (el.type === "radio" && !el.checked))
    return;
  let value = el.type === "checkbox" ? el.checked : el.value;
  if (scope === "subject-personal" && value === "inherit") {
    delete data.personalOverrides?.[ui.dnaSubject]?.[key];
    save();
    refreshScopedPreview();
    return;
  }
  if (typeof defaults[key] === "number") {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || value === "") return;
    value = Math.max(
      1,
      Math.min(
        key === "problemCount" ? 100 : key === "questionCount" ? 15 : 3,
        Math.round(numeric),
      ),
    );
    el.value = String(value);
  }
  if (scope === "personal")
    data.personalDNA = { ...personalSettings(), [key]: value };
  else if (scope === "subject") {
    data.subjectDNA ||= {};
    data.subjectDNA[ui.dnaSubject] = {
      ...subjectSettings(ui.dnaSubject),
      [key]: value,
    };
  } else if (scope === "subject-personal") {
    data.personalOverrides ||= {};
    data.personalOverrides[ui.dnaSubject] = {
      ...data.personalOverrides[ui.dnaSubject],
      [key]: value,
    };
  } else if (scope === "new-subject") ui.newSubjectDraft[key] = value;
  else if (scope === "new-note") ui.newNoteSettings[key] = value;
  else if (note()) note().runSettings = { ...noteSettings(), [key]: value };
  updateConditionalSettings(scope);
  if (scope === "new-subject") updateConditionalSettings("new-note");
  if (key === "organization" && $("#organization-help"))
    $("#organization-help").textContent = organizationHelp(value);
  if (!scope.startsWith("new-")) {
    const ok = save();
    const status = $("#dna-save-state");
    if (status)
      status.innerHTML =
        icon(ok ? "check" : "clock") + (ok ? "저장됨" : "저장 공간 확인 필요");
    refreshScopedPreview();
  }
}
function updateConditionalSettings(scope) {
  const show = (id, visible) => {
    const el = $("#" + scope + "-" + id);
    if (el) el.hidden = !visible;
  };
  if (scope === "subject" || scope === "new-subject") {
    const d =
      scope === "subject" ? subjectSettings(ui.dnaSubject) : ui.newSubjectDraft;
    show("formula", d.hasMath);
    show("weights", d.materialMode === "직접 조정");
    show("visual-options", d.visuals !== "생성하지 않음");
    show("question-options", d.problemType !== "생성하지 않음");
  }
  if (scope === "note" || scope === "new-note") {
    const r = scope === "note" ? noteSettings() : ui.newNoteSettings;
    const selectedSubject = $("#upload-subject")?.value;
    const d =
      scope === "note"
        ? dna()
        : deriveDNA(
            personalSettings(),
            selectedSubject === "__new"
              ? ui.newSubjectDraft
              : subjectSettings(selectedSubject),
          );
    const effective = effectiveNoteDNA(note(), d, r);
    show("page-range", r.scopeMode === "단원·페이지 선택");
    show("exam-range", r.scopeMode === "시험 범위 직접 입력");
    show("sources", r.sourceMode === "selected");
    show("question-options", effective.generateQuestions);
    show("custom-count", r.problemCountChoice === "custom");
    show("difficulty-control", effective.problemCount > 0);
    const hint = $("#" + scope + "-mode-hint");
    if (hint) hint.innerHTML = modeHint(r);
  }
}
function noteSettingsEntry(n) {
  const r = noteSettings(n);
  return `<button class="note-settings-entry" data-action="note-settings">${icon("dna")}<span>${esc(r.mode)}<small> · ${esc(r.length)}</small></span><span class="note-settings-edit">이번 노트 설정 ${icon("right")}</span></button>`;
}
function refreshNewNoteSources() {
  const list = $("#new-note-sources");
  if (!list) return;
  const r = ui.newNoteSettings;
  if (!ui.upload) r.sourceIds = [];
  list.innerHTML = sourceCheckboxes(
    availableNoteSources(null, true),
    r,
    "new-note",
  );
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
  const p = personalSettings(),
    s = subjectSettings(subject);
  for (const key of keys) {
    if (key === "density") p.density = t[key];
    if (key === "formula")
      s.formula =
        {
          수식만: "결과만 표시",
          "수식 + 설명": "의미와 사용법 설명",
          "자세한 풀이": "유도 과정과 계산 예시",
        }[t[key]] || s.formula;
    if (key === "formats")
      p.layoutPreference =
        t.formats.includes("표") && t.formats.includes("글머리표")
          ? "표와 목록을 적절히 혼합"
          : t.formats.includes("표")
            ? "표 중심"
            : "목록 중심";
  }
  if (subject === "기본") data.personalDNA = p;
  else {
    data.personalOverrides ||= {};
    const overrides = { ...data.personalOverrides[subject] };
    if (keys.includes("density")) overrides.density = p.density;
    if (keys.includes("formats"))
      overrides.layoutPreference = p.layoutPreference;
    if (keys.includes("difficulty"))
      overrides.examplePreference =
        t.difficulty === "예시까지"
          ? "다양한 예시 3개 이상"
          : "개념별 예시 2개";
    data.personalOverrides[subject] = overrides;
  }
  data.subjectDNA ||= {};
  data.subjectDNA[subject] = s;
}
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "settings-subject") {
    ui.dnaSubject = el.value;
    ui.draft = structuredClone(dna(el.value));
    render();
    return;
  }
  if (el.dataset.settingScope) persistSettingControl(el);
  if (el.dataset.sourceScope) {
    const isNew = el.dataset.sourceScope === "new-note",
      r = isNew ? ui.newNoteSettings : noteSettings();
    r.sourceIds = el.checked
      ? [...new Set([...r.sourceIds, el.value])]
      : r.sourceIds.filter((id) => id !== el.value);
    if (!isNew && note()) {
      note().runSettings = r;
      save();
      refreshScopedPreview();
    }
    const status = $(
      ".source-selection-status",
      $("#" + el.dataset.sourceScope + "-sources"),
    );
    if (status)
      status.textContent = r.sourceIds.length
        ? ""
        : "사용할 자료를 하나 이상 선택해 주세요.";
  }
});
document.addEventListener("input", (e) => {
  if (
    e.target.matches(
      'textarea[data-setting-scope],input[type="text"][data-setting-scope],input:not([type])[data-setting-scope]',
    )
  )
    persistSettingControl(e.target);
});
