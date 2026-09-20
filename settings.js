"use strict";
// Version 5: stable personal style, course content, and independent learning DNA.
const personalDefaults = {
  headingStyle: "일반적인 3단계",
  numbering: "1. → 1) → a.",
  layoutPreference: "표와 목록을 적절히 혼합",
  emphasisStyle: "굵게",
  emphasisAmount: "핵심만",
  tone: "쉬운 설명체",
  learn: true,
};
const subjectDefaults = {
  organization: "이해하기 좋은 흐름으로",
  mode: "개념 이해",
  examplePreference: "다양한 예시 3개 이상",
  exampleCount: 3,
  exampleTypes: ["비유", "실생활 사례"],
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
const exampleKinds = ["비유", "실생활 사례", "단계별 풀이", "응용"];
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
  emphasisStyle: ["굵게", "형광펜", "빨간줄", "별표"],
  emphasisAmount: ["적게", "핵심만", "많이"],
  tone: ["간결한 노트체", "쉬운 설명체", "강의 필기체"],
};
const toneDescriptions = {
  "간결한 노트체": ["짧게 요점만", "핵심어와 짧은 문장으로 빠르게 훑어봐요."],
  "쉬운 설명체": ["차근차근 설명", "낯선 개념도 문장으로 이어서 이해해요."],
  "강의 필기체": ["수업 필기처럼", "화살표와 짧은 메모로 흐름을 잡아요."],
};
const optionLabels = {
  headingStyle: {
    "간단하게 2단계": "간단하게 · 제목과 내용",
    "일반적인 3단계": "기본형 · 주제와 소제목",
    "자세하게 4단계": "세분화 · 세부 항목까지",
  },
  layoutPreference: {
    "목록 중심": "목록 위주",
    "표와 목록을 적절히 혼합": "내용에 맞게 섞기",
    "표 중심": "비교표 위주",
  },
  emphasisStyle: {
    굵게: "굵은 글씨",
    형광펜: "은은한 배경색",
    빨간줄: "색 밑줄",
    별표: "별표 표시",
  },
  emphasisAmount: {
    적게: "꼭 필요한 곳만",
    핵심만: "핵심마다 적당히",
    많이: "놓치지 않게 넉넉히",
  },
  organization: {
    "강의자료 순서대로": "자료 순서 유지",
    "핵심 개념·키워드별": "비슷한 개념끼리 묶기",
    "이해하기 좋은 흐름으로": "기초에서 응용 순서로",
  },
  examplePreference: {
    "예시 없이": "예시 없이 간결하게",
    "핵심 예시 1개": "대표 예시만",
    "개념별 예시 2개": "헷갈리는 개념에 충분히",
    "다양한 예시 3개 이상": "여러 상황으로 익히기",
  },
  formula: {
    "결과만 표시": "핵심 수식만",
    "의미와 사용법 설명": "기호의 뜻과 쓰임까지",
    "유도 과정과 계산 예시": "풀이 과정을 단계별로",
    "수식 거의 없음": "수식 설명 생략",
  },
  terminology: {
    "핵심 용어만": "낯선 핵심 용어만",
    "처음 등장할 때 설명": "처음 나올 때 짧게",
    "모든 전문용어를 자세히 설명": "기초 개념부터 풀어서",
  },
  length: {
    "핵심만 간단히": "복습용 요약",
    "적당한 분량": "핵심과 설명을 균형 있게",
    "최대한 자세히": "빠짐없이 상세하게",
  },
  questionDifficulty: {
    기초: "기초 · 개념 확인",
    "강의 수준": "보통 · 배운 내용 응용",
    "시험 수준": "실전 · 시험 연습",
    심화: "심화 · 새로운 상황에 적용",
  },
};
function settingLabel(key, value) {
  return optionLabels[key]?.[value] || value;
}
const previewSamples = {
  운영체제: {
    title: "필요한 페이지만 가져오기",
    keyword: "요구 페이징",
    sub: "메모리를 사용하는 방식",
    section: "페이지가 없을 때의 처리",
    tones: {
      "간결한 노트체":
        "요구 페이징: 필요한 페이지만 메모리에 적재. 없는 페이지에 접근하면 페이지 폴트 발생.",
      "쉬운 설명체":
        "실행에 필요한 페이지만 메모리에 올리는 방식이다. 필요한 페이지가 아직 없다면 운영체제가 가져온 뒤 작업을 이어 간다.",
      "강의 필기체":
        "필요한 페이지만 적재 → 메모리 절약\n페이지가 없다면? 페이지 폴트 → 적재 → 다시 실행\n기억: 페이지 폴트가 항상 잘못된 접근은 아님",
    },
    points: ["필요한 시점에 페이지 적재", "페이지 폴트 후 명령 재실행"],
    table: [
      ["메모리에 있음", "바로 접근"],
      ["메모리에 없음", "페이지 폴트 처리"],
    ],
    examples: [
      "책장 전체 대신 지금 읽는 책만 책상에 꺼내는 것과 비슷하다.",
      "100페이지 중 3페이지만 쓰면 필요한 부분부터 올릴 수 있다.",
      "새로운 페이지가 필요해지면 그때 추가로 가져온다.",
    ],
    questions: {
      객관식: "요구 페이징의 특징으로 알맞은 것은?",
      단답형: "필요한 페이지가 메모리에 없을 때 발생하는 예외는?",
      주관식: "요구 페이징이 메모리 사용을 줄이는 이유를 설명하시오.",
      OX: "페이지 폴트는 항상 잘못된 메모리 접근을 뜻한다. (O / X)",
    },
    combined:
      "메모리 관리와 스케줄링을 연결해, 페이지 폴트가 실행 중인 작업에 미치는 영향을 설명하시오.",
  },
  알고리즘: {
    title: "같은 계산은 한 번만",
    keyword: "메모이제이션",
    sub: "계산 결과의 재사용",
    section: "중복 계산 줄이기",
    tones: {
      "간결한 노트체":
        "메모이제이션: 계산 결과를 저장해 재사용. 같은 부분 문제의 반복 계산을 줄임.",
      "쉬운 설명체":
        "이미 구한 답을 저장했다가 같은 문제가 나오면 다시 사용하는 방법이다. 같은 계산을 반복하지 않아 시간을 줄일 수 있다.",
      "강의 필기체":
        "같은 계산 반복? → 답을 저장\n다음 호출 → 저장한 답 재사용\n확인: 어떤 값을 저장할지 먼저 정하기",
    },
    points: ["계산한 결과를 저장", "같은 입력에서는 결과 재사용"],
    table: [
      ["결과가 있음", "저장된 값 반환"],
      ["결과가 없음", "계산 후 저장"],
    ],
    examples: [
      "피보나치 수열에서 이미 구한 값을 저장하면 중복 호출을 줄일 수 있다.",
      "격자의 같은 위치까지 오는 경우의 수를 저장해 활용할 수 있다.",
      "저장 공간과 줄어드는 계산량을 함께 비교한다.",
    ],
    questions: {
      객관식: "메모이제이션을 적용하기 적합한 상황은?",
      단답형: "계산한 결과를 저장해 재사용하는 기법의 이름은?",
      주관식: "메모이제이션에서 상태 정의가 중요한 이유를 설명하시오.",
      OX: "메모이제이션은 이미 계산한 결과를 재사용한다. (O / X)",
    },
    combined:
      "재귀와 동적 계획법을 연결해, 같은 부분 문제를 반복 계산하는 구조를 개선하시오.",
  },
  선형대수: {
    title: "행렬을 변환으로 읽기",
    keyword: "선형 변환",
    sub: "기저벡터가 이동하는 방향",
    section: "행렬의 열이 의미하는 것",
    tones: {
      "간결한 노트체":
        "행렬의 각 열: 표준 기저벡터의 변환 결과. 벡터의 변환은 열벡터의 선형 결합으로 계산.",
      "쉬운 설명체":
        "행렬의 각 열은 기본 방향의 벡터가 어디로 이동하는지 알려 준다. 이 결과를 조합하면 다른 벡터가 어떻게 바뀌는지도 알 수 있다.",
      "강의 필기체":
        "첫째 열 = 첫 기저벡터가 간 곳\n둘째 열 = 둘째 기저벡터가 간 곳\n벡터 변환 → 각 열을 계수에 맞춰 더하기",
    },
    points: ["기저벡터의 이동을 먼저 확인", "선형 결합으로 전체 변환 계산"],
    table: [
      ["첫 번째 열", "첫 기저벡터의 변환"],
      ["두 번째 열", "둘째 기저벡터의 변환"],
    ],
    examples: [
      "대각행렬 [[2,0],[0,3]]은 x축을 2배, y축을 3배 늘린다.",
      "벡터 (1,2)는 이 변환을 거쳐 (2,6)이 된다.",
      "열벡터 표기에서 ABx는 B를 먼저 적용하고 A를 적용한다.",
    ],
    questions: {
      객관식: "행렬의 첫 번째 열이 나타내는 것은?",
      단답형: "표준 기저벡터 (1,0)의 변환 결과는 행렬의 몇 번째 열인가?",
      주관식:
        "행렬의 열만 알면 모든 벡터의 변환을 구할 수 있는 이유를 설명하시오.",
      OX: "선형 변환은 벡터의 덧셈을 보존한다. (O / X)",
    },
    combined:
      "선형 변환과 행렬식을 연결해, 변환 전후의 넓이 변화를 설명하시오.",
  },
};
function previewSample(subject) {
  return (
    previewSamples[subject] || {
      title: "핵심 개념을 연결하며 읽기",
      keyword: "핵심 개념",
      sub: "정의에서 활용까지",
      section: "내 말로 설명하기",
      tones: {
        "간결한 노트체":
          "개념 정리: 정의, 특징, 적용 조건을 함께 기록. 비슷한 개념과의 차이를 확인.",
        "쉬운 설명체":
          "새 개념을 배울 때는 뜻만 외우기보다 어떤 상황에서 쓰는지 함께 살펴보자. 비슷한 개념과 비교하면 차이가 더 분명해진다.",
        "강의 필기체":
          "정의 → 특징 → 쓰이는 상황\n비슷한 개념과 무엇이 다를까?\n마지막으로 내 말로 설명해 보기",
      },
      points: ["정의와 적용 조건 함께 기록", "비슷한 개념과 차이 비교"],
      table: [
        ["정의", "무엇을 의미하는가"],
        ["적용", "언제 사용할 수 있는가"],
      ],
      examples: ["강의에서 다룬 사례를 해당 개념과 연결해 정리한다."],
      questions: {
        객관식: "핵심 개념의 특징으로 알맞은 것은?",
        단답형: "이번 단원의 핵심 용어를 쓰시오.",
        주관식: "주요 개념의 정의와 적용 조건을 설명하시오.",
        OX: "제시된 설명이 배운 정의에 맞는지 판단하시오. (O / X)",
      },
      combined: "두 단원에서 배운 개념을 연결해 공통점과 차이를 설명하시오.",
    }
  );
}
const modePresets = {
  "개념 이해": {
    length: "적당한 분량",
    examplePreference: "다양한 예시 3개 이상",
    exampleCount: 3,
    exampleTypes: ["비유", "실생활 사례"],
    formula: "유도 과정과 계산 예시",
    terminology: "모든 전문용어를 자세히 설명",
    research: "lecture",
    lectureWeight: 3,
    professorWeight: 3,
    classWeight: 2,
    description: "수업 내용을 확실히 이해하기",
    detail:
      "예시와 수식·용어 설명을 늘리고, 첨부 자료 밖의 설명는 사용하지 않아요.",
  },
  "심화 학습": {
    length: "최대한 자세히",
    examplePreference: "핵심 예시 1개",
    exampleCount: 1,
    exampleTypes: ["응용"],
    formula: "결과만 표시",
    terminology: "핵심 용어만",
    research: "academic",
    lectureWeight: 2,
    professorWeight: 2,
    classWeight: 2,
    description: "외부 자료로 더 깊게",
    detail:
      "예시와 수식·용어의 기본 설명은 줄이고, 외부 학술자료와 응용 내용을 보강해요.",
  },
  "시험 대비": {
    length: "핵심만 간단히",
    examplePreference: "개념별 예시 2개",
    exampleCount: 2,
    exampleTypes: ["단계별 풀이", "응용"],
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
  if (data.settingsVersion === 5) return;
  if (data.settingsVersion === 4) {
    upgradeExampleSettings();
    return;
  }
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
      emphasisStyle:
        oldPersonal.emphasisStyle || personalDefaults.emphasisStyle,
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
  upgradeExampleSettings();
}
function upgradeExampleSettings() {
  for (const d of Object.values(data.subjectDNA || {})) {
    if (d.exampleCount === undefined)
      d.exampleCount =
        {
          "예시 없이": 0,
          "핵심 예시 1개": 1,
          "개념별 예시 2개": 2,
          "다양한 예시 3개 이상": 3,
        }[d.examplePreference] ?? 2;
    if (!Array.isArray(d.exampleTypes) || !d.exampleTypes.length)
      d.exampleTypes = [
        ...(modePresets[d.mode]?.exampleTypes || subjectDefaults.exampleTypes),
      ];
  }
  data.settingsVersion = 5;
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
    examples: subject.exampleCount > 0,
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
// Ordered preferences use a discrete slider; categories stay visible as radio cards.
const stepSettingKeys = new Set([
  "emphasisAmount",
  "length",
  "terminology",
  "research",
  "questionDifficulty",
  "lectureWeight",
  "textbookWeight",
  "classWeight",
  "professorWeight",
  "classPriority",
]);
const compactChoiceLabels = {
  headingStyle: ["2단계", "3단계", "4단계"],
  layoutPreference: ["목록 위주", "알맞게 혼합", "표 위주"],
  emphasisStyle: ["굵게", "형광펜", "밑줄", "별표"],
  emphasisAmount: ["적게", "적당히", "많이"],
  organization: ["자료 순서", "개념별", "이해 흐름"],
  length: ["핵심만", "적당히", "자세히"],
  terminology: ["핵심만", "첫 등장에", "자세히"],
  formula: ["수식만", "뜻과 쓰임", "풀이까지", "생략"],
  research: ["사용 안 함", "필요할 때", "넓게 보충", "학술 심화"],
  questionDifficulty: ["기초", "강의 수준", "시험 수준", "심화"],
  visuals: ["자동 선택", "개념도", "흐름도", "비교표", "사용 안 함"],
};
function scopeSelect(scope, key, label, options, value, help = "") {
  const choices = options.map((o, i) => {
    const [v, t] = Array.isArray(o) ? o : [o, o];
    return {
      value: v,
      title: compactChoiceLabels[key]?.[i] || t,
      detail: settingLabel(key, t),
    };
  });
  const current = Math.max(
    0,
    choices.findIndex((o) => String(o.value) === String(value)),
  );
  const id = `${scope}-${key}`;
  const detail =
    key === "organization"
      ? organizationHelp(value)
      : help || choices[current].detail;
  const isStep = stepSettingKeys.has(key);
  const controls = isStep
    ? `<div class="dna-step-control" style="--steps:${choices.length}"><input class="dna-step-slider" id="${id}-range" type="range" min="0" max="${choices.length - 1}" step="1" value="${current}" data-step-scope="${scope}" data-step-key="${key}" aria-labelledby="${id}-label" aria-describedby="${id}-help" aria-valuetext="${esc(choices[current].detail)}" style="--fill:${(current / (choices.length - 1)) * 100}%"><div class="dna-step-labels">${choices.map((o, i) => `<button type="button" data-action="setting-step" data-step-index="${i}" class="${current === i ? "is-selected" : ""}" tabindex="-1" aria-label="${esc(label + "：" + o.detail)}">${esc(o.title)}</button>`).join("")}</div></div>`
    : `<div class="dna-visible-choices ${key === "numbering" ? "numbering-choices" : ""}">${choices.map((o, i) => `<label class="dna-choice-option"><input type="radio" name="${id}" data-setting-scope="${scope}" data-setting-key="${key}" value="${esc(o.value)}" ${current === i ? "checked" : ""} aria-describedby="${id}-help"><span>${esc(o.title)}</span></label>`).join("")}</div>`;
  return `<fieldset class="dna-choice-field ${isStep ? "is-step" : "is-category"}" data-choice-scope="${scope}" data-choice-key="${key}" data-choice-options="${esc(JSON.stringify(choices))}"><legend id="${id}-label">${esc(label)}</legend>${controls}<p class="dna-choice-help" id="${id}-help">${esc(detail)}</p></fieldset>`;
}
function syncVisibleChoices(scope, d) {
  for (const field of $$(`[data-choice-scope="${scope}"]`)) {
    const key = field.dataset.choiceKey,
      choices = JSON.parse(field.dataset.choiceOptions);
    const index = Math.max(
      0,
      choices.findIndex((o) => String(o.value) === String(d[key])),
    );
    const range = field.querySelector("[data-step-scope]");
    if (range) {
      range.value = String(index);
      range.style.setProperty(
        "--fill",
        `${(index / (choices.length - 1)) * 100}%`,
      );
      range.setAttribute("aria-valuetext", choices[index].detail);
      for (const button of field.querySelectorAll("[data-step-index]"))
        button.classList.toggle(
          "is-selected",
          Number(button.dataset.stepIndex) === index,
        );
    } else {
      for (const radio of field.querySelectorAll('input[type="radio"]'))
        radio.checked = String(radio.value) === String(d[key]);
    }
    field.querySelector(".dna-choice-help").textContent =
      key === "organization" ? organizationHelp(d[key]) : choices[index].detail;
  }
}
function persistStepControl(range) {
  const choices = JSON.parse(
    range.closest(".dna-choice-field").dataset.choiceOptions,
  );
  const index = Math.max(
    0,
    Math.min(choices.length - 1, Math.round(Number(range.value))),
  );
  persistSettingControl({
    dataset: {
      settingScope: range.dataset.stepScope,
      settingKey: range.dataset.stepKey,
    },
    type: "select-one",
    value: String(choices[index].value),
  });
}
function advancedSettings(label, content) {
  return `<details class="dna-advanced"><summary>${label}<span>펼쳐보기</span></summary><div class="dna-advanced-body">${content}</div></details>`;
}
function personalFields(d) {
  const select = (key, label) =>
    scopeSelect("personal", key, label, personalOptions[key], d[key]);
  return `<div class="dna-form-grid">${select("headingStyle", "노트의 단계")}${select("layoutPreference", "내용을 담는 방식")}</div><fieldset class="dna-tone-group compact-tones"><legend>읽기 편한 문체</legend><p>평소 노트를 읽고 쓰는 방식에 맞춰 선택하세요.</p><div class="dna-tone-options">${personalOptions.tone.map((tone) => `<label class="dna-tone-card"><input type="radio" name="dna-tone" data-setting-scope="personal" data-setting-key="tone" value="${tone}" ${d.tone === tone ? "checked" : ""}><span><strong>${toneDescriptions[tone][0]}</strong><span class="tone-sample">${toneDescriptions[tone][1]}</span></span></label>`).join("")}</div></fieldset>${advancedSettings("번호와 강조 다듬기", `<div class="dna-form-grid">${select("numbering", "번호 표기")}${select("emphasisStyle", "강조 표시")}${select("emphasisAmount", "강조하는 빈도")}</div>`)}<p class="dna-setting-hint">미리보기의 과목을 바꿔도 이 취향은 모든 과목에 공통으로 적용돼요.</p>`;
}
function organizationHelp(value) {
  return value === "강의자료 순서대로"
    ? "챕터 안에서 PDF 페이지와 PPT 슬라이드 순서를 유지해요."
    : value === "핵심 개념·키워드별"
      ? "챕터 안의 내용을 같은 개념과 키워드끼리 모아요."
      : "각 챕터에서 선수 개념부터 응용까지 이해하기 좋은 순서로 정리해요.";
}
function presetMatches(d, mode = d.mode) {
  const preset = modePresets[mode];
  return (
    !!preset &&
    Object.keys(preset)
      .filter((key) => key in subjectDefaults)
      .every((key) => JSON.stringify(d[key]) === JSON.stringify(preset[key]))
  );
}
function subjectPresetLabel(d) {
  return presetMatches(d) ? d.mode + " 설정" : "맞춤 설정";
}
function modeHint(d) {
  return presetMatches(d)
    ? `<span>${modePresets[d.mode].detail}</span>`
    : "<span>개별 항목을 조절한 맞춤 설정이에요. 다른 구성이 필요하면 위에서 다시 골라주세요.</span>";
}
function subjectFields(d, scope = "subject") {
  const select = (key, label, options, help = "") =>
    scopeSelect(scope, key, label, options, d[key], help);
  const weight = [
    [0, "제외"],
    [1, "가볍게 참고"],
    [2, "함께 반영"],
    [3, "우선 반영"],
  ];
  return `<div class="dna-preset-box"><div class="dna-preset-title"><strong>한 번에 맞추기</strong><small>예시·설명·분량·자료 반영을 함께 설정</small></div><div class="dna-preset-buttons" role="group" aria-label="내용 설정 프리셋">${Object.keys(
    modePresets,
  )
    .map((mode) =>
      btn(
        mode,
        "subject-preset",
        d.mode === mode && presetMatches(d, mode) ? "active" : "",
        `data-preset="${mode}" data-preset-scope="${scope}" aria-pressed="${d.mode === mode && presetMatches(d, mode)}"`,
      ),
    )
    .join(
      "",
    )}</div><div class="dna-preset-status" id="${scope}-mode-hint" role="status">${modeHint(d)}</div></div><div class="dna-form-grid course-settings-flat">${select("organization", "내용을 배열하는 순서", ["강의자료 순서대로", "핵심 개념·키워드별", "이해하기 좋은 흐름으로"])}${select("length", "노트 분량", ["핵심만 간단히", "적당한 분량", "최대한 자세히"])}${select(
    "research",
    "자료 밖의 설명 보충",
    [
      ["lecture", "첨부 자료 안에서만"],
      ["balanced", "이해에 필요한 부분만"],
      ["deep", "관련 개념까지 넓게"],
      ["academic", "논문·전문 자료까지"],
    ],
  )}</div>${exampleControls(d, scope)}${advancedSettings("수식과 낯선 용어", `<div class="dna-form-grid"><div id="${scope}-formula" ${d.hasMath ? "" : "hidden"}>${select("formula", "수식은 어디까지 설명할까요?", ["결과만 표시", "의미와 사용법 설명", "유도 과정과 계산 예시", "수식 거의 없음"])}</div>${select("terminology", "용어는 얼마나 풀어쓸까요?", ["핵심 용어만", "처음 등장할 때 설명", "모든 전문용어를 자세히 설명"])}</div><label class="check-row"><input type="checkbox" data-setting-scope="${scope}" data-setting-key="hasMath" ${d.hasMath ? "checked" : ""}>수식이 있는 과목이에요</label>`)}${advancedSettings(
    "자료의 우선순위와 시각자료",
    `<p class="settings-help">정리할 때 더 비중 있게 참고할 자료를 골라요.</p><div class="dna-form-grid">${select("lectureWeight", "강의자료", weight)}${select("textbookWeight", "교재", weight)}${select("classWeight", "내 필기", weight)}${select("professorWeight", "교수님 설명", weight)}${select(
      "visuals",
      "그림으로 정리하기",
      [
        ["AI가 자동 선택", "내용에 맞게 선택"],
        ["마인드맵·개념도", "개념의 관계 보기"],
        ["흐름도·구조도", "과정과 순서 보기"],
        ["표·비교표", "차이점 비교하기"],
        ["생성하지 않음", "글로만 정리"],
      ],
    )}${select("classPriority", "내 필기의 중요도", [
      [1, "참고 내용"],
      [2, "중요 내용"],
      [3, "시험 핵심 내용"],
    ])}</div><label class="check-row"><input type="checkbox" data-setting-scope="${scope}" data-setting-key="classEmphasis" ${d.classEmphasis ? "checked" : ""}>필기에 표시한 중요한 구절을 먼저 반영</label>`,
  )}<p class="dna-setting-hint">원하는 항목만 바꿔도 바로 저장돼요. 기본 DNA와 학습 DNA는 그대로 유지됩니다.</p>`;
}
function learningFields(d, scope = "learning") {
  return `<fieldset class="dna-question-types"><legend>어떻게 확인할까요?</legend><p>빠른 확인과 직접 설명하는 연습을 함께 고를 수 있어요.</p><div class="dna-type-options">${["객관식", "단답형", "주관식", "OX"].map((type) => `<label><input type="checkbox" data-learning-type="${scope}" value="${type}" ${d.problemTypes.includes(type) ? "checked" : ""}>${type === "주관식" ? "서술형" : type}</label>`).join("")}</div></fieldset><div class="dna-form-grid"><label class="dna-field"><span>문제 개수</span><div class="dna-number-wrap"><input type="number" min="0" max="100" step="1" data-setting-scope="${scope}" data-setting-key="questionCount" value="${d.questionCount}"><span>개</span></div><small>0개를 선택하면 문제를 생성하지 않아요.</small></label>${scopeSelect(scope, "questionDifficulty", "문제 난이도", ["기초", "강의 수준", "시험 수준", "심화"], d.questionDifficulty)}</div><label class="dna-field full"><span>학습·시험 범위</span><input data-setting-scope="${scope}" data-setting-key="examRange" maxlength="200" value="${esc(d.examRange)}" placeholder="예: 중간고사 2–5장, PDF 20–85페이지"><small>비워두면 등록된 자료 전체를 범위로 사용해요.</small></label><fieldset class="dna-chapter-group"><legend>출제 범위 구성</legend><div class="dna-chapter-options">${[
    ["챕터별", "단원마다 핵심을 확인"],
    ["챕터 융합", "배운 개념을 연결해서 응용"],
  ]
    .map(
      ([value, help]) =>
        `<label><input type="radio" name="${scope}-chapters" data-setting-scope="${scope}" data-setting-key="chapterMode" value="${value}" ${d.chapterMode === value ? "checked" : ""}><span><strong>${value === "챕터별" ? "단원별로 차근차근" : "여러 단원을 연결해서"}</strong><small>${help}</small></span></label>`,
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
    ["subject", "과목별 DNA", "이 과목에 맞는 정리"],
    ["learning", "학습 DNA", "문제와 시험 준비"],
  ];
  const descriptions = {
    personal: "과목이 바뀌어도 유지되는, 나에게 익숙한 노트 스타일입니다.",
    subject: "필요한 항목만 조절하거나, 추천 구성으로 한 번에 맞춰보세요.",
    learning: "이 과목의 문제 유형, 난이도와 이번 시험 범위를 정해요.",
  };
  return `<section class="page dna-settings"><header class="page-header"><div><span class="dna-eyebrow">NOTE DNA</span><h1>나에게 맞는 정리</h1><p>자주 쓰는 방식은 저장하고, 필요한 만큼만 조절하세요.</p></div><span class="dna-autosave" id="dna-save-state" role="status">${icon("check")} 자동 저장</span></header><nav class="dna-scope-tabs" aria-label="개인화 설정">${scopes.map(([key, title, sub]) => btn(`<strong>${title}</strong><small>${sub}</small>`, "settings-scope", key === scope ? "active" : "", `data-scope="${key}" aria-current="${key === scope ? "page" : "false"}"`)).join("")}</nav><div class="dna-settings-layout"><div class="dna-settings-main"><div class="dna-scope-heading"><div><h2>${scopes.find((s) => s[0] === scope)[1]}</h2><p>${descriptions[scope]}</p></div>${scope === "personal" ? "" : subjectPicker()}</div>${scope === "personal" ? personalFields(personalSettings()) : scope === "subject" ? subjectFields(subjectSettings(ui.dnaSubject)) : learningFields(learningSettings(ui.dnaSubject))}${scope === "personal" && !data.basicDNAReady ? `<div class="dna-onboarding-finish">${btn("이 설정으로 시작하기" + icon("arrow"), "finish-dna", "btn primary")}</div>` : ""}<p class="dna-scope-foot">${icon("lock")}${scope === "personal" ? "모든 과목에 같은 표현 방식을 사용합니다." : esc(ui.dnaSubject) + " 과목에만 저장됩니다."}</p>${scope === "subject" ? advancedSettings("편집 습관에서 발견했어요", `<div class="dna-habit-wrap">${habitPanel(ui.dnaSubject, d)}</div>`) : ""}</div><aside class="dna-settings-aside"><div class="dna-preview-card"><div class="preview-label">${icon("file")}${scope === "learning" ? "학습 구성 미리보기" : "노트 스타일 미리보기"}</div><div id="dna-preview">${scopedPreview(d)}</div><p class="dna-preview-help">설정에 따른 예시입니다. 기존 노트 본문은 유지되며, 실제 AI 정리·문제 생성은 연결 후 제공됩니다.</p></div></aside></div></section>`;
}
function styledTone(d, sample) {
  const lines = (sample.tones[d.tone] || sample.tones["쉬운 설명체"]).split(
    "\n",
  );
  const mark = (text) =>
    d.emphasisStyle === "빨간줄"
      ? `<span class="dna-redline">${text}</span>`
      : d.emphasisStyle === "별표"
        ? `<span class="dna-star-mark">★</span> ${text}`
        : d.emphasisStyle === "형광펜"
          ? `<mark class="dna-soft-mark">${text}</mark>`
          : `<strong>${text}</strong>`;
  return lines
    .map((line, i) => {
      const text = esc(line);
      const short = esc(line.split(/[ :：,.]/)[0]);
      return `<p>${d.emphasisAmount === "많이" || (d.emphasisAmount === "핵심만" && i === 0) ? mark(text) : d.emphasisAmount === "적게" && i === 0 ? text.replace(short, mark(short)) : text}</p>`;
    })
    .join("");
}
function previewSubjectPicker() {
  const current = ui.previewSubject || ui.dnaSubject || "운영체제";
  const subjects = [
    ...new Set([
      ...Object.keys(previewSamples),
      ...data.notes.map((n) => n.subject),
    ]),
  ];
  return `<label class="dna-preview-switch"><span>예시 과목</span><select id="dna-preview-subject" aria-label="미리보기 과목">${subjects.map((s) => `<option value="${esc(s)}" ${s === current ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>`;
}
function scopedPreview(d) {
  const scope = ui.settingsScope || "personal",
    subject =
      scope === "personal" ? ui.previewSubject || ui.dnaSubject : ui.dnaSubject,
    sample = previewSample(subject),
    l = learningSettings(ui.dnaSubject),
    s = subjectSettings(ui.dnaSubject);
  if (scope === "learning")
    return `<div class="dna-mini-note"><span class="dna-preview-caption">${esc(subject)} · 복습 계획</span><h3>${l.questionCount ? l.questionCount + "문제로 확인하기" : "이번에는 노트만 읽기"}</h3><div class="dna-learning-tags">${l.problemTypes.map((t) => `<span>${t === "주관식" ? "서술형" : esc(t)}</span>`).join("")}</div><dl class="dna-plan-list"><div><dt>난이도</dt><dd>${esc(settingLabel("questionDifficulty", l.questionDifficulty))}</dd></div><div><dt>범위</dt><dd>${esc(l.examRange || "등록된 자료 전체")}</dd></div><div><dt>출제 구성</dt><dd>${l.chapterMode === "챕터별" ? "단원별로 차근차근" : "여러 단원을 연결해서"}</dd></div></dl>${l.questionCount ? `<div class="dna-question-sample"><small>문항 형식 예시 · 실제 생성 아님</small><p>${esc(l.chapterMode === "챕터 융합" ? sample.combined : sample.questions[l.problemTypes[0]] || sample.questions["주관식"])}</p></div>` : ""}</div>`;
  const prefix = d.numbering === "글머리표 중심" ? "• " : "1. ",
    sub =
      d.numbering === "1. → (1) → ①"
        ? "(1)"
        : d.numbering === "글머리표 중심"
          ? "◦"
          : "1)";
  return `${scope === "personal" ? previewSubjectPicker() : ""}<div class="dna-mini-note"><span class="dna-preview-caption">${esc(subject)} · ${esc(sample.keyword)} 예시</span><h3>${prefix}${esc(sample.title)}</h3>${d.headingStyle !== "간단하게 2단계" ? `<h4>${sub} ${esc(sample.sub)}</h4>` : ""}${d.headingStyle === "자세하게 4단계" ? `<small>${d.numbering === "1. → (1) → ①" ? "①" : "a."} ${esc(sample.section)}</small>` : ""}<div class="dna-tone-preview">${styledTone(d, sample)}</div>${d.layoutPreference !== "표 중심" ? `<ul>${sample.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}${d.layoutPreference !== "목록 중심" ? `<table><tbody>${sample.table.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""}${
    scope === "subject"
      ? `${examplePreview(
          s,
          subject,
        )}<div class="dna-run-summary"><strong>${esc(subjectPresetLabel(s))}</strong><span>${esc(settingLabel("organization", s.organization))}</span><span>설명 · ${esc(settingLabel("length", s.length))}</span>${s.hasMath ? `<span>수식 · ${esc(settingLabel("formula", s.formula))}</span>` : ""}<span>용어 · ${esc(settingLabel("terminology", s.terminology))}</span><span>외부 보충 · ${researchLabel(s.research)}</span></div>`
      : ""
  }</div>`;
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
  if (action === "setting-step") {
    const range = el
      .closest(".dna-choice-field")
      .querySelector("[data-step-scope]");
    range.value = el.dataset.stepIndex;
    persistStepControl(range);
    range.focus();
    return true;
  }
  if (action === "subject-preset") {
    persistSettingControl({
      dataset: { settingScope: el.dataset.presetScope, settingKey: "mode" },
      type: "button",
      value: el.dataset.preset,
    });
    return true;
  }
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
    if (preset[key] !== undefined) next[key] = structuredClone(preset[key]);
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
      Math.min(
        key === "questionCount" ? 100 : key === "exampleCount" ? 10 : 3,
        Math.round(v),
      ),
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
    if (key === "exampleCount")
      d.examplePreference =
        value === 0
          ? "예시 없이"
          : value === 1
            ? "핵심 예시 1개"
            : value === 2
              ? "개념별 예시 2개"
              : "다양한 예시 3개 이상";
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
  if (scope === "personal") syncVisibleChoices(scope, personalSettings());
  if (scope === "learning" || scope === "new-learning")
    syncVisibleChoices(
      scope,
      scope === "learning"
        ? learningSettings(ui.dnaSubject)
        : ui.newLearningDraft,
    );
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
  syncVisibleChoices(scope, d);
  for (const button of $$(`[data-preset-scope="${scope}"]`)) {
    const active =
      d.mode === button.dataset.preset &&
      presetMatches(d, button.dataset.preset);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
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
  for (const el of $$(`[data-example-scope="${scope}"]`)) {
    el.checked = d.exampleTypes.includes(el.value);
    el.disabled = d.exampleCount === 0;
  }
  const summary = $("#" + scope + "-example-summary");
  if (summary) summary.textContent = exampleSummary(d);
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
  return `<div class="dna-creation-summary"><span>${icon("dna")}과목의 DNA를 가져와요</span><strong>${esc(subjectPresetLabel(s))} · ${esc(s.length)}</strong><small>${l.questionCount ? `${l.problemTypes.map(esc).join(" · ")} / ${l.questionCount}개 / ${esc(l.chapterMode)}` : "문제 생성 안 함"}</small></div>`;
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
  return `<button class="note-settings-entry" data-action="note-settings">${icon("dna")}<span>${esc(subjectPresetLabel(s))}<small> · ${esc(s.length)}</small></span><span class="note-settings-edit">과목별 DNA ${icon("right")}</span></button>`;
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
  if (el.id === "dna-preview-subject") {
    ui.previewSubject = el.value;
    refreshScopedPreview();
    $("#dna-preview-subject")?.focus();
    return;
  }
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
function exampleSummary(d) {
  return d.exampleCount === 0
    ? "예시 없이 정리해요."
    : "개념 하나당 선택한 종류를 섞어 총 " + d.exampleCount + "개를 넣어요.";
}
function exampleControls(d, scope) {
  const descriptions = {
    비유: "익숙한 것에 빗대어",
    "실생활 사례": "현실의 구체적인 상황",
    "단계별 풀이": "과정을 따라가며",
    응용: "새로운 상황에 적용",
  };
  return `<fieldset class="dna-example-settings"><legend>예시</legend><div class="dna-example-kind-grid">${exampleKinds.map((type) => `<label><input type="checkbox" data-example-scope="${scope}" value="${type}" ${d.exampleTypes.includes(type) ? "checked" : ""} ${d.exampleCount === 0 ? "disabled" : ""}><span><strong>${type}</strong><small>${descriptions[type]}</small></span></label>`).join("")}</div><div class="dna-example-count"><label for="${scope}-example-count">개념당 예시 수</label><div class="dna-number-wrap"><input id="${scope}-example-count" type="number" min="0" max="10" step="1" data-setting-scope="${scope}" data-setting-key="exampleCount" value="${d.exampleCount}"><span>개</span></div></div><p class="dna-setting-hint" id="${scope}-example-summary">${exampleSummary(d)}</p><small class="dna-example-limit">0개는 예시 없이 · 최대 10개</small></fieldset>`;
}
function exampleTypeText(subject, type) {
  const examples = {
    운영체제: {
      비유: "책장 전체를 책상으로 옮기지 않고, 지금 읽을 책만 꺼내는 것과 비슷하다.",
      "실생활 사례":
        "한동안 쓰지 않던 앱으로 돌아갈 때, 필요한 페이지를 저장장치에서 다시 읽어오는 경우가 있다.",
      "단계별 풀이":
        "페이지 참조 → 메모리에 없는지 확인 → 필요한 페이지 적재 → 페이지 테이블 갱신 → 명령 재실행.",
      응용: "사용 가능한 프레임이 적을 때, 어떤 접근 순서가 페이지 폴트를 늘리는지 비교해 본다.",
    },
    알고리즘: {
      비유: "한번 계산한 답을 메모장에 적어두고, 같은 질문을 받으면 그 답을 꺼내는 것과 같다.",
      "실생활 사례":
        "입력 조건이 같은 배송비를 여러 번 구할 때, 처음 계산한 값을 저장해 다시 쓸 수 있다.",
      "단계별 풀이":
        "f(0)=0, f(1)=1 저장 → f(2)=1 저장 → 저장한 f(1)과 f(2)를 더해 f(3)=2 계산.",
      응용: "격자에서 같은 위치까지 오는 경우의 수를 저장해, 목적지까지 가능한 경로를 구한다.",
    },
    선형대수: {
      비유: "격자의 두 기본 방향을 늘이거나 돌리는 규칙을 정하면, 그 위의 모든 점이 함께 움직이는 것과 같다.",
      "실생활 사례":
        "이미지를 가로 2배, 세로 3배 늘릴 때 각 좌표에 같은 확대 변환을 적용한다.",
      "단계별 풀이":
        "A=[[2,0],[0,3]], x=(1,2) → 첫 좌표 2×1+0×2=2 → 둘째 좌표 0×1+3×2=6 → Ax=(2,6).",
      응용: "축별로 다르게 확대한 뒤 회전하는 경우와, 회전한 뒤 확대하는 경우의 결과를 비교한다.",
    },
  };
  return (
    examples[subject]?.[type] ||
    {
      비유: "익숙한 사물이나 상황에 빗대어 핵심 개념의 구조를 설명합니다.",
      "실생활 사례":
        "배운 개념이 실제 상황에서 쓰이는 구체적인 사례를 연결합니다.",
      "단계별 풀이":
        "주어진 조건을 확인하고 해결 과정과 결과를 순서대로 설명합니다.",
      응용: "배운 개념을 새로운 조건이나 다른 단원의 내용에 적용해 봅니다.",
    }[type]
  );
}
function examplePreview(d, subject) {
  if (!d.exampleCount)
    return '<p class="dna-example-off">예시 없이 간결하게 정리</p>';
  const types = d.exampleTypes.slice(0, Math.min(d.exampleCount, 2));
  return `<div class="dna-example-preview"><div class="dna-example-preview-head"><strong>개념당 ${d.exampleCount}개</strong><small>${d.exampleTypes.map(esc).join(" · ")}</small></div>${types.map((type) => `<div class="dna-context-example"><small>${esc(type)}</small><p>${esc(exampleTypeText(subject, type))}</p></div>`).join("")}<small class="dna-example-preview-foot">선택한 방식의 표현 예시 · 최대 2종 표시</small></div>`;
}
document.addEventListener("change", (e) => {
  const el = e.target,
    scope = el.dataset.exampleScope;
  if (!scope) return;
  const d =
    scope === "new-subject"
      ? ui.newSubjectDraft
      : subjectSettings(ui.dnaSubject);
  const types = el.checked
    ? [...new Set([...d.exampleTypes, el.value])]
    : d.exampleTypes.filter((t) => t !== el.value);
  if (!types.length) {
    el.checked = true;
    toast(
      "예시 종류를 하나 이상 선택해 주세요. 예시가 필요 없으면 0개로 설정하세요.",
    );
    return;
  }
  d.exampleTypes = types;
  syncSubjectControls(scope, d);
  if (scope === "new-subject") {
    ui.newSubjectDraft = d;
    refreshCreationSummary();
  } else {
    data.subjectDNA ||= {};
    data.subjectDNA[ui.dnaSubject] = d;
    save();
    refreshScopedPreview();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.dataset.settingKey === "exampleCount")
    persistSettingControl(e.target);
});

// Native sliders support dragging, tapping, and arrow keys without custom gesture code.
document.addEventListener("input", (e) => {
  if (e.target.dataset.stepScope) persistStepControl(e.target);
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.stepScope) persistStepControl(e.target);
});
