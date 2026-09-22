"use strict";
// The workspace keeps one note per subject and leaves the original records recoverable.
function initializeWorkspace() {
  data.savedTemplates ||= [];
  data.savedPrompts ||= [];
  data.communityItems ||= [];
  data.communityLikes ||= [];
  if (data.workspaceVersion === 1) return;
  data.beforeWorkspaceNotes = structuredClone(data.notes);
  const grouped = new Map();
  for (const original of data.notes) {
    const key = original.subject.trim().toLocaleLowerCase();
    const n = grouped.get(key);
    const materials =
      original.materials ||
      (original.file
        ? [
            {
              id: uid(),
              name: original.file,
              fileKey: original.fileKey || null,
              kind: "강의자료",
              originId: original.id,
              sample: !!original.sample,
            },
          ]
        : []);
    const blocks = original.blocks.map((b) => ({
      ...b,
      chapter: b.chapter || original.title,
      originNoteId: b.originNoteId || original.id,
      originFile: b.originFile || original.file,
    }));
    if (n) {
      n.blocks.push(...blocks);
      n.materials.push(...materials);
      n.classNotes.push(...(original.classNotes || []));
      n.problemSets.push(...(original.problemSets || []));
      n.starred ||= original.starred;
    } else
      grouped.set(key, {
        ...original,
        title: original.subject,
        shortTitle: original.subject,
        blocks,
        materials,
        classNotes: original.classNotes || [],
        problemSets: original.problemSets || [],
        activeTemplate: subjectSettings(original.subject).mode || "개념 이해",
      });
    data.subjectDNA[original.subject] = {
      ...subjectSettings(original.subject),
      headingStyle:
        data.personalDNA.headingStyle || subjectDefaults.headingStyle,
    };
  }
  data.notes = [...grouped.values()];
  data.workspaceVersion = 1;
}
function workspaceRender() {
  closePopover();
  if (!["editor", "practice", "dna-manager"].includes(ui.view))
    ui.view = "editor";
  if (note()) {
    ui.dnaSubject = note().subject;
    ui.draft = structuredClone(dna());
    ensureDnaState(note());
  }
  data.pinnedDNA ??= Object.keys(modePresets);
  ui.settingsScope = "subject";
  document.title =
    (ui.view === "dna-manager" ? "DNA 관리" : note()?.title || "내 노트") +
    " — Note DNA";
  $("#app").innerHTML =
    `<div class="app-shell desk-shell ${ui.detailsOpen ? "rail-mobile-open" : ""} ${ui.railOpen === false ? "rail-hidden" : ""}">${sidebar()}<div class="mobile-shade" data-action="mobile-close"></div><main class="workspace" id="main">${header()}<div class="desk-columns"><div class="desk-content">${ui.view === "dna-manager" ? dnaManagerPage() : ui.view === "practice" ? practicePage() : editor()}</div>${ui.view === "editor" && note() ? workspaceRail() : ""}</div></main></div>`;
  applyDnaPresentation();
}

function workspaceNavigate(view) {
  save();
  ui.selected = null;
  ui.sourceOpen = false;
  if (view === "dna") {
    ui.view = "dna-manager";
    ui.detailsOpen = false;
    ui.railOpen = true;
  } else if (view === "templates") {
    libraryModal();
    return;
  } else ui.view = view === "practice" ? "practice" : "editor";
  render();
}
function workspaceSidebar() {
  const query = (ui.noteFilter || "").toLowerCase();
  return `<aside class="sidebar desk-sidebar" aria-label="노트 목록"><div class="desk-brand">${icon("dna")}<strong>Note DNA</strong></div>${btn(icon("dna") + "<span>DNA</span>", "ws-dna-manager", "desk-note-link desk-dna-link " + (ui.view === "dna-manager" ? "current" : ""))}<div class="desk-notes-title"><span>노트</span>${btn(icon("plus"), "upload", "icon-button", 'aria-label="새 노트"')}</div><label class="desk-search">${icon("search")}<input id="desk-note-search" type="search" placeholder="노트 찾기" aria-label="노트 찾기" value="${esc(ui.noteFilter || "")}"></label><nav id="desk-note-list" aria-label="내 노트">${workspaceNoteLinks(query)}</nav><div class="desk-sidebar-foot">${icon("lock")} 이 기기에 저장됨</div></aside>`;
}
function workspaceNoteLinks(query = "") {
  return (
    data.notes
      .filter((n) => (n.title + " " + n.subject).toLowerCase().includes(query))
      .map((n) =>
        btn(
          icon("file") + `<span>${esc(n.title)}</span>`,
          "open-note",
          "desk-note-link " +
            (n.id === ui.noteId && ui.view !== "dna-manager" ? "current" : ""),
          `data-id="${esc(n.id)}" aria-current="${n.id === ui.noteId ? "page" : "false"}"`,
        ),
      )
      .join("") || '<p class="desk-empty-list">노트가 없어요.</p>'
  );
}
function workspaceHeader() {
  if (ui.view === "dna-manager")
    return `<header class="topbar desk-topbar">${btn(icon("menu"), "mobile", "icon-button mobile-toggle", 'aria-label="노트 목록 열기"')}<div class="desk-tab">${icon("dna")}<span>DNA 관리</span></div><div class="top-actions">${note() ? btn("노트로 돌아가기", "ws-note", "btn ghost") : ""}</div></header>`;
  return `<header class="topbar desk-topbar">${btn(icon("menu"), "mobile", "icon-button mobile-toggle", 'aria-label="노트 목록 열기"')}<div class="desk-tab">${icon(ui.view === "practice" ? "light" : "file")}<span>${esc(note()?.title || "내 노트")}${ui.view === "practice" ? " · 학습" : ""}</span></div><div class="top-actions">${note() ? `${ui.view === "practice" ? btn("노트로 돌아가기", "ws-note", "btn ghost") : ""}${btn(icon("upload") + "자료", "ws-materials", "btn ghost")}${btn(icon("download") + "공유", "ws-share", "btn ghost")}${btn(icon("more"), "ws-note-menu", "icon-button", 'aria-label="노트 메뉴"')}${ui.view !== "practice" ? btn(icon("panel"), "ws-rail", "icon-button", 'aria-label="오른쪽 패널 열기 또는 닫기"') : ""}` : ""}</div></header>`;
}
function workspaceEditor() {
  const n = note();
  if (!n)
    return `<div class="desk-welcome"><div>${icon("book")}<h1>한 과목, 한 권의 노트</h1><p>자료와 필기를 모아 나에게 맞는 방식으로 정리하세요.</p>${btn("첫 노트 만들기", "upload", "btn primary")}</div></div>`;
  let count = 0;
  return `<article class="desk-document"><div class="desk-document-top"><span>${esc(n.subject)}</span><span class="save-status">${icon("check")} 저장됨</span></div><h1 id="note-title" contenteditable="true" role="textbox" aria-label="노트 제목" spellcheck="false">${esc(n.title)}</h1><div class="desk-document-meta"><span>${n.blocks.length}개 블록</span><span>최근 수정 ${dateLabel(n.updated)}</span>${btn("생성 설정", "ws-origin", "text-button")}</div>${ui.sourceOpen ? sourcePanel() : ""}<div class="note-canvas" aria-label="노트 편집기">${
    n.blocks
      .filter((b) => !isSideNoteBlock(b))
      .map((b) => blockHTML(b, b.title ? ++count : count))
      .join("") ||
    '<p class="desk-placeholder">메모를 추가하거나 자료를 가져와 시작하세요.</p>'
  }</div></article>`;
}
function workspaceRail() {
  const n = note(),
    choices = dnaChoices().filter((t) => data.pinnedDNA.includes(t.id));
  return `<aside class="desk-rail" aria-label="DNA 설정"><div class="desk-rail-scroll"><div class="desk-rail-heading"><h2>${icon("dna")} DNA 설정</h2><span id="dna-save-state">자동 저장</span></div><p class="desk-hint">고정한 DNA를 선택해 이 노트에 적용하세요.</p><div class="desk-template-list" role="group" aria-label="고정한 DNA">${choices.map((t) => btn(`<span>${esc(t.name)}</span>${n.activeTemplate === t.id && !dnaIsDirty() ? icon("check") : ""}`, "ws-template", n.activeTemplate === t.id && !dnaIsDirty() ? "selected" : "", `data-id="${esc(t.id)}" aria-pressed="${n.activeTemplate === t.id && !dnaIsDirty()}"`)).join("") || '<p class="desk-hint">고정한 DNA가 없어요. DNA 관리에서 핀을 눌러 추가하세요.</p>'}</div><p class="dna-active-caption">현재: ${esc((!dnaIsDirty() && dnaChoices().find((t) => t.id === n.activeTemplate)?.name) || "직접 수정한 설정")}</p>${btn("DNA 관리" + icon("right"), "ws-dna-manager", "desk-details-button")}${workspaceSideNotes()}</div><div class="desk-rail-bottom">${btn(icon("light") + "학습하기" + icon("arrow"), "ws-practice", "btn primary")}<small>문제 만들기 · 풀이 · 오답 확인</small></div></aside>`;
}

function workspacePersonalFields() {
  const d = personalSettings(),
    select = (k, t) => scopeSelect("personal", k, t, personalOptions[k], d[k]);
  return (
    advancedSettings(
      "문체와 배치",
      select("tone", "문체") + select("layoutPreference", "표와 목록"),
      "desk-dna",
    ) +
    advancedSettings("번호 표기", numberingControls(d), "desk-dna") +
    advancedSettings(
      "강조",
      select("emphasisStyle", "강조 표시") +
        select("emphasisAmount", "강조 빈도"),
      "desk-dna",
    )
  );
}

function workspaceNoteFields(d) {
  const s = (k, t, opts) => scopeSelect("subject", k, t, opts, d[k]);
  const weights = [
    [0, "제외"],
    [1, "가볍게"],
    [2, "균형 있게"],
    [3, "우선 반영"],
  ];
  return (
    advancedSettings(
      "내용",
      s("headingStyle", "단락 구분 정도", personalOptions.headingStyle) +
        s("organization", "정리 순서", [
          "강의자료 순서대로",
          "핵심 개념·키워드별",
          "이해하기 좋은 흐름으로",
        ]) +
        s("length", "노트 분량", [
          "핵심만 간단히",
          "적당한 분량",
          "최대한 자세히",
        ]) +
        s("explanation", "설명 난이도", ["기초부터", "강의 수준", "전공 심화"]),
      "desk-dna",
      true,
    ) +
    advancedSettings(
      "수식과 용어",
      s("hasMath", "수식이 있는 노트", [
        [true, "있음"],
        [false, "없음"],
      ]) +
        `<div id="subject-formula" ${d.hasMath ? "" : "hidden"}>${s("formula", "수식 설명", ["결과만 표시", "의미와 사용법 설명", "유도 과정과 계산 예시", "수식 거의 없음"])}</div>` +
        s("terminology", "용어 설명", [
          "핵심 용어만",
          "처음 등장할 때 설명",
          "모든 전문용어를 자세히 설명",
        ]),
      "desk-dna",
    ) +
    advancedSettings(
      "내용 보충",
      exampleControls(d, "subject") +
        s("research", "자료 밖의 설명 보충", [
          ["lecture", "사용 안 함"],
          ["balanced", "필요한 부분"],
          ["deep", "넓게 보충"],
          ["academic", "학술 심화"],
        ]) +
        s("lectureWeight", "강의자료", weights) +
        s("textbookWeight", "교재", weights) +
        s("classWeight", "개인 필기", weights) +
        s("professorWeight", "교수 설명", weights) +
        s("visuals", "시각자료", [
          "AI가 자동 선택",
          "마인드맵·개념도",
          "흐름도·구조도",
          "표·비교표",
          "생성하지 않음",
        ]),
      "desk-dna",
    )
  );
}
function workspaceSettingsManagement() {
  return `<label class="check-row"><input type="checkbox" data-setting-scope="personal" data-setting-key="learn" ${personalSettings().learn ? "checked" : ""}>편집 습관으로 추천 받기</label>${workspaceHabit()}<div class="desk-inline-actions">${btn("편집 기록 초기화", "ws-reset-history", "btn secondary")}${btn("DNA 기본값 복원", "ws-reset-dna", "btn secondary")}</div>`;
}
function workspaceHabit() {
  if (data.workspaceHabitDismissed?.[note()?.id] === data.history.length)
    return '<p class="desk-hint">이번 추천을 무시했어요. 새로운 편집 후 다시 살펴볼게요.</p>';
  const entries = data.history
    .filter(
      (x) =>
        x.subject === note()?.subject && x.before > 0 && x.after < x.before,
    )
    .slice(-5);
  if (entries.length < 3)
    return '<p class="desk-hint">긴 설명을 줄인 기록이 3회 이상 쌓이면 설정을 제안해요. 적용하기 전에는 설정을 바꾸지 않습니다.</p>';
  const percent = Math.round(
    (entries.reduce((s, e) => s + (1 - e.after / e.before), 0) /
      entries.length) *
      100,
  );
  return `<p class="desk-hint">최근 ${entries.length}회 편집에서 설명을 평균 ${percent}% 줄였어요.</p>${percent >= 20 && personalSettings().learn ? `<p>노트 분량을 핵심만으로 바꿀까요?</p>${btn("적용", "ws-habit-apply", "btn secondary")}${btn("무시", "ws-habit-ignore", "btn ghost")}` : ""}`;
}
function workspaceCreateModal(append = false) {
  ui.creation = { append, files: [], template: "개념 이해" };
  showModal(
    append ? "노트에 자료 추가" : "새 노트",
    `<label class="form-field"><span>과목 이름</span><input id="ws-course-name" maxlength="80" placeholder="예: 운영체제" value="${append ? esc(note().subject) : ""}" ${append ? "readonly" : ""}></label><p class="desk-hint">과목마다 하나의 노트에 자료와 필기를 모아요.</p><label class="desk-upload">${icon("upload")}<strong>자료 선택</strong><span>PDF, PPT, 교재, 개인 필기 · 파일당 25MB</span><input id="ws-source-files" type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"></label><div id="ws-picked-materials"></div><label class="form-field"><span>DNA</span><select id="ws-create-template" ${append ? "disabled" : ""}>${append ? '<option value="">현재 노트의 DNA 유지</option>' : ""}${Object.keys(
      modePresets,
    )
      .map((t) => `<option>${t}</option>`)
      .join(
        "",
      )}${data.savedTemplates.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("")}</select></label><label class="form-field"><span>추가 요청</span><textarea id="ws-create-prompt" rows="3" maxlength="2000" placeholder="예: 교수님이 강조한 내용 위주로 정리해줘."></textarea></label><label class="form-field"><span>저장한 프롬프트</span><select id="ws-create-saved-prompt"><option value="">선택 안 함</option>${dnaPrompts()
      .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
      .join(
        "",
      )}</select></label><p class="desk-hint">텍스트는 노트로 가져옵니다. PDF·PPT 분석과 AI 정리는 연결 전이며 원본과 생성 설정을 보관합니다.</p><p id="ws-create-error" role="alert" class="form-error"></p>`,
    btn("취소", "close-modal", "btn secondary") +
      btn(append ? "자료 추가" : "노트 만들기", "create-note", "btn primary"),
  );
}
function workspacePickFiles(files) {
  if (!ui.creation) return;
  const error = $("#ws-create-error");
  for (const file of files) {
    if (
      !/\.(pdf|pptx?|docx?|txt|md|png|jpe?g|webp)$/i.test(file.name) ||
      file.size > 25 * 1024 * 1024
    ) {
      error.textContent = "지원하는 형식과 파일당 25MB 제한을 확인해 주세요.";
      continue;
    }
    if (ui.creation.files.length >= 15) {
      error.textContent = "한 번에 15개까지 추가할 수 있어요.";
      break;
    }
    ui.creation.files.push({ file, kind: "강의자료", id: uid() });
  }
  $("#ws-picked-materials").innerHTML = ui.creation.files
    .map(
      (f) =>
        `<div class="desk-file-row">${icon("file")}<span>${esc(f.file.name)}</span><select data-file-kind="${f.id}" aria-label="${esc(f.file.name)} 자료 종류">${["강의자료", "교재", "개인 필기", "교수 설명"].map((k) => `<option ${k === f.kind ? "selected" : ""}>${k}</option>`).join("")}</select>${btn(icon("close"), "ws-remove-picked", "icon-button", `data-id="${f.id}" aria-label="파일 제외"`)}</div>`,
    )
    .join("");
}
async function workspaceCreateNote() {
  if (!ui.creation) return;
  const subject = $("#ws-course-name").value.trim(),
    error = $("#ws-create-error"),
    submit = $('[data-action="create-note"]');
  if (!subject) {
    error.textContent = "과목 이름을 입력해 주세요.";
    return;
  }
  const existing = data.notes.find(
    (n) => n.subject.trim().toLowerCase() === subject.toLowerCase(),
  );
  const templateId = $("#ws-create-template").value,
    prompt = $("#ws-create-prompt").value.trim();
  if (existing && !ui.creation.files.length && !ui.creation.append) {
    closeModal();
    openNote(existing.id);
    toast("같은 과목의 노트를 열었어요. 자료를 이어서 추가할 수 있어요.");
    return;
  }
  submit.disabled = true;
  submit.textContent = "저장 중…";
  const materials = [],
    blocks = [],
    classNotes = [];
  try {
    for (const source of ui.creation.files) {
      let text = "";
      if (/\.(txt|md)$/i.test(source.file.name)) {
        text = await source.file.text();
        if (text.length > 400000)
          throw new Error("텍스트는 40만 자 이하로 나누어 주세요.");
      }
      await storeFile(source.id, source.file);
      materials.push({
        id: source.id,
        name: source.file.name,
        fileKey: source.id,
        kind: source.kind,
        text,
        createdAt: new Date().toISOString(),
      });
      if (source.kind === "개인 필기") {
        classNotes.push({
          id: source.id,
          name: source.file.name,
          fileKey: source.id,
          text,
          updated: new Date().toISOString(),
        });
      }
      if (text)
        blocks.push({
          id: uid(),
          title: source.file.name.replace(/\.[^.]+$/, ""),
          type: "text",
          source: source.kind === "개인 필기" ? "class-notes" : "original",
          sourceName: source.file.name,
          sourceId: source.id,
          materialId: source.id,
          originFile: source.file.name,
          chapter: source.file.name,
          priority: 1,
          page: 1,
          html: markdownToHTML(text),
        });
    }
    snapshot();
    const n = existing || {
      id: uid(),
      title: subject,
      subject,
      blocks: [],
      materials: [],
      classNotes: [],
      problemSets: [],
      sample: false,
      pages: 0,
    };
    n.materials ||= [];
    n.classNotes ||= [];
    n.blocks.push(...blocks);
    n.materials.push(...materials);
    n.classNotes.push(...classNotes);
    n.updated = new Date().toISOString();
    if (!n.fileKey && materials[0]) {
      n.fileKey = materials[0].fileKey;
      n.file = materials[0].name;
    }
    if (!existing) {
      data.notes.unshift(n);
      data.subjectDNA[subject] = structuredClone(subjectDefaults);
      data.learningDNA[subject] = structuredClone(learningDefaults);
      applyWorkspaceTemplate(templateId, n);
    }
    n.runSettings = {
      ...n.runSettings,
      prompt: prompt || n.runSettings?.prompt || "",
    };
    n.generationSettings = {
      personal: personalSettings(),
      note: subjectSettings(subject),
      prompt: n.runSettings.prompt,
      template: n.activeTemplate,
      createdAt: n.updated,
    };
    if (!n.blocks.length)
      n.blocks.push({
        id: uid(),
        title: "수업 메모",
        type: "memo",
        source: "memo",
        priority: 1,
        html: "<p>첫 내용을 기록해 보세요.</p>",
      });
    save();
    closeModal();
    openNote(n.id);
    toast(
      materials.length ? "자료와 설정을 저장했어요." : "새 노트를 만들었어요.",
    );
  } catch (e) {
    error.textContent = e.message || "저장하지 못했어요.";
    submit.disabled = false;
    submit.textContent = "다시 시도";
  }
}
function applyWorkspaceTemplate(id, n = note()) {
  if (!n) return;
  if (modePresets[id])
    data.subjectDNA[n.subject] = applySubjectMode(
      subjectSettings(n.subject),
      id,
    );
  else {
    const t = data.savedTemplates.find((t) => t.id === id);
    if (!t) return;
    data.personalDNA = {
      ...personalSettings(),
      ...pickSettings(t.personal || {}, personalDefaults),
    };
    data.subjectDNA[n.subject] = {
      ...subjectSettings(n.subject),
      ...pickSettings(t.settings || {}, subjectDefaults),
    };
    n.runSettings = { ...n.runSettings, prompt: t.prompt || "" };
    n.dnaPrompts = structuredClone(t.prompts || []);
  }
  if (modePresets[id]) {
    n.runSettings = { ...n.runSettings, prompt: "" };
    n.dnaPrompts = [];
  }
  n.activeTemplate = id;
  n.savedDnaSignature = dnaSignature(n);
  n.savedDnaId = id;
}
function templateSaveModal(id) {
  const t = data.savedTemplates.find((t) => t.id === id);
  ui.editTemplateId = id || null;
  showModal(
    t ? "DNA 편집" : "현재 설정 DNA로 새로 저장",
    `<label class="form-field"><span>이름</span><input id="ws-template-name" maxlength="80" value="${esc(t?.name || "")}" placeholder="예: 나의 전공 노트"></label><label class="form-field"><span>설명</span><textarea id="ws-template-description" maxlength="500">${esc(t?.description || "")}</textarea></label>${t ? '<label class="check-row"><input id="ws-template-refresh" type="checkbox">현재 노트의 DNA 설정으로 갱신</label>' : '<p class="desk-hint">사용자 DNA, 노트 DNA와 추가 요청을 함께 보관합니다.</p>'}`,
    btn("취소", "close-modal", "btn secondary") +
      btn("저장", "ws-commit-template", "btn primary"),
  );
}
function libraryModal(tab = "templates") {
  if (tab === "templates") {
    closeModal();
    ui.view = "dna-manager";
    render();
    return;
  }
  ui.libraryTab = tab;
  showModal(
    "보관함",
    `<div class="desk-modal-tabs">${[
      [tab, tab === "prompts" ? "프롬프트 보관함" : "공유 DNA"],
    ]
      .map(([k, t]) =>
        btn(t, "ws-library-tab", tab === k ? "active" : "", `data-tab="${k}"`),
      )
      .join(
        "",
      )}</div><label class="desk-search">${icon("search")}<input id="ws-library-search" placeholder="이름·설명 검색" aria-label="보관함 검색"></label>${tab === "community" ? '<p class="desk-hint">공유 UI 체험용 목록입니다. 등록과 반응은 이 기기에만 저장됩니다.</p><select id="ws-community-sort" aria-label="공유 목록 정렬"><option value="recent">등록일순</option><option value="likes">좋아요순</option><option value="imports">가져가기순</option></select>' : ""}<div id="ws-library-results">${libraryResults(tab)}</div><div class="desk-inline-actions">${tab === "templates" ? btn("현재 설정 DNA로 새로 저장", "ws-save-template", "btn secondary") : tab === "prompts" ? btn("프롬프트 추가", "ws-new-prompt", "btn secondary") : ""}${btn("공유 파일 가져오기", "ws-import-package", "btn secondary")}<input id="ws-package-file" type="file" accept="application/json,.json" hidden></div>`,
    btn("닫기", "close-modal", "btn secondary"),
  );
}
function communitySamples() {
  return Object.keys(modePresets).map((name, i) => ({
    id: "community-" + i,
    name,
    description: modePresets[name].detail,
    author: "Note DNA 예시",
    subject: "전공 공통",
    purpose: name,
    personal: personalDefaults,
    settings: applySubjectMode(subjectDefaults, name),
    example: "개념 → 설명 → 연결되는 사례",
    date: "2026-09-01",
    likes: 0,
    imports: 0,
    kind: "template",
  }));
}
function libraryResults(tab, query = "", sort = "recent") {
  let items =
    tab === "templates"
      ? data.savedTemplates
      : tab === "prompts"
        ? dnaPrompts()
        : [...communitySamples(), ...data.communityItems];
  items = items.filter((t) =>
    (
      t.name +
      " " +
      (t.description || t.text || "") +
      " " +
      (t.subject || "") +
      " " +
      (t.purpose || "")
    )
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (tab === "community")
    items = items.map((t) => ({
      ...t,
      likes: (t.likes || 0) + (data.communityLikes.includes(t.id) ? 1 : 0),
      imports: (t.imports || 0) + (data.communityImports?.[t.id] || 0),
    }));
  if (tab === "community")
    items.sort((a, b) =>
      sort === "recent"
        ? String(b.date).localeCompare(a.date)
        : (b[sort] || 0) - (a[sort] || 0),
    );
  return items.length
    ? items
        .map(
          (t) =>
            `<article class="desk-library-item"><div><strong>${esc(t.name)}</strong><p>${esc(t.description || t.text || "")}</p>${tab === "community" ? `<small>${esc(t.author)} · ${esc(t.subject || "공통")} · ${esc(t.purpose || "자유")}</small>` : ""}</div><div class="desk-inline-actions">${btn("미리보기", "ws-library-preview", "text-button", `data-id="${t.id}" data-kind="${tab}"`)}${tab === "templates" ? btn("편집", "ws-edit-template", "text-button", `data-id="${t.id}"`) : tab === "prompts" ? btn("편집", "ws-edit-prompt", "text-button", `data-id="${t.id}"`) : btn(data.communityLikes.includes(t.id) ? "♥ 좋아요" : "♡ 좋아요", "ws-like", "text-button", `data-id="${t.id}"`)}${tab !== "community" ? btn("삭제", "ws-library-delete", "text-button", `data-id="${t.id}" data-kind="${tab}"`) : ""}</div></article>`,
        )
        .join("")
    : '<div class="desk-empty-list">아직 저장한 항목이 없어요.</div>';
}
function libraryPreview(id, kind) {
  const list =
    kind === "templates"
      ? data.savedTemplates
      : kind === "prompts"
        ? dnaPrompts()
        : [...communitySamples(), ...data.communityItems];
  const t = list.find((t) => t.id === id);
  if (!t) return;
  ui.libraryItem = { id, kind };
  showModal(
    esc(t.name),
    `<p>${esc(t.description || t.text || "")}</p>${t.settings ? `<dl class="desk-definition"><dt>노트 분량</dt><dd>${esc(t.settings.length)}</dd><dt>용어 설명</dt><dd>${esc(t.settings.terminology)}</dd><dt>예시</dt><dd>${esc((t.settings.exampleTypes || []).join(" · ") || "없음")}</dd><dt>문체</dt><dd>${esc(t.personal?.tone || "쉬운 설명체")}</dd></dl><div class="desk-sample">${esc(t.example || "개념을 이해한 뒤 핵심과 예시를 연결하는 노트 구성입니다.")}</div>` : `<div class="desk-sample">${esc(t.text || "")}</div>`}`,
    btn(
      "보관함",
      kind === "prompts" ? "dna-prompt-library" : "ws-library",
      "btn secondary",
    ) +
      btn(
        kind === "community" ? "내 보관함으로 가져오기" : "이 노트에 적용",
        "ws-use-library-item",
        "btn primary",
      ) +
      (kind !== "community"
        ? btn("공유", "ws-share-library", "btn secondary")
        : ""),
  );
}
function promptModal(id) {
  const p = dnaPrompts().find((p) => p.id === id);
  ui.editPromptId = id || null;
  showModal(
    p ? "프롬프트 편집" : "프롬프트 저장",
    `<label class="form-field"><span>이름</span><input id="ws-prompt-name" maxlength="80" value="${esc(p?.name || "")}"></label><label class="form-field"><span>요청 내용</span><textarea id="ws-prompt-text" rows="5" maxlength="2000">${esc(p?.text || note()?.runSettings?.prompt || "")}</textarea></label>`,
    btn("저장", "ws-commit-prompt", "btn primary"),
  );
}
function noteShareModal() {
  showModal(
    "내보내기와 공유",
    `<p class="desk-hint">포함할 내용을 선택하고 파일로 공유하세요. 원본 첨부 파일은 포함되지 않습니다.</p><label class="check-row"><input id="ws-export-sources" type="checkbox" checked>출처 표시 포함</label><label class="check-row"><input id="ws-export-professor" type="checkbox" checked>교수 설명 포함</label><label class="check-row"><input id="ws-export-memos" type="checkbox" checked>개인 메모·필기 포함</label><div class="desk-export-options">${btn("Markdown", "ws-export", "btn secondary", 'data-format="md"')}${btn("HTML 문서", "ws-export", "btn secondary", 'data-format="html"')}${btn("공유용 노트 파일", "ws-export", "btn secondary", 'data-format="json"')}${btn("인쇄 / PDF", "ws-export", "btn secondary", 'data-format="print"')}</div><p class="desk-hint">공유용 노트 파일은 Note DNA에서 다시 가져올 수 있습니다.</p>`,
    btn("닫기", "close-modal", "btn secondary"),
  );
}
function buildWorkspaceExport(options, n = note()) {
  const blocks = n.blocks
    .filter(
      (b) =>
        (options.memos || !["memo", "class-notes"].includes(b.source)) &&
        (options.professor ||
          (b.source !== "professor" &&
            !(n.materials || []).some(
              (m) => m.kind === "교수 설명" && m.id === b.materialId,
            ))),
    )
    .map((b) => ({ ...b, html: sanitize(b.html) }));
  const html = `<h1>${esc(n.title)}</h1>${blocks.map((b) => `<section>${b.title ? `<h2>${esc(b.title)}</h2>` : ""}${options.sources ? `<small>${esc(b.originFile || b.sourceName || b.source)}${b.page ? " · p." + b.page : ""}</small>` : ""}${b.html}${b.formula ? `<p>${esc(b.formula)}</p>` : ""}</section>`).join("")}`;
  return {
    blocks,
    html,
    markdown:
      "# " +
      n.title +
      "\n\n" +
      blocks
        .map(
          (b) =>
            `## ${b.title || "메모"}\n\n${workspaceText(b.html)}${b.formula ? "\n" + b.formula : ""}${options.sources ? "\n\n> " + (b.originFile || b.sourceName || b.source) : ""}`,
        )
        .join("\n\n"),
  };
}
function practicePage() {
  const n = note();
  if (!n) return '<div class="desk-welcome">먼저 노트를 만들어 주세요.</div>';
  const sets = (n.problemSets ||= []),
    current = sets.find((s) => s.id === ui.activeSetId);
  return `<section class="practice-page"><header class="practice-heading"><div><span class="desk-eyebrow">${esc(n.title)}</span><h1>학습하기</h1><p>배운 내용을 확인하고, 헷갈린 부분을 다시 읽어보세요.</p></div>${btn(icon("plus") + "문제 만들기", "ws-question-settings", "btn primary")}</header>${current ? practiceSession(current) : `<div class="practice-start"><div>${icon("light")}<h2>이 노트로 연습해 볼까요?</h2><p>범위와 문제 유형을 고르면 노트의 내용을 바탕으로 연습 문제를 만들어요.</p>${btn("문제 생성 설정", "ws-question-settings", "btn secondary")}</div></div><h2 class="desk-section-title">저장한 문제 세트</h2><div class="practice-set-list">${sets.length ? sets.map((s) => `<article><div><strong>${esc(s.name)}</strong><p>${s.questions.length}문제 · ${esc(s.settings.questionDifficulty)} · ${s.submitted ? "풀이 완료" : "풀이 중"}</p></div>${btn("열기", "ws-open-set", "btn secondary", `data-id="${s.id}"`)}${btn(icon("trash"), "ws-delete-set", "icon-button", `data-id="${s.id}" aria-label="문제 세트 삭제"`)}</article>`).join("") : '<p class="desk-hint">만든 문제와 풀이 기록은 이 노트에 저장됩니다.</p>'}</div>`}</section>`;
}
function questionSettingsModal() {
  ui.newLearningDraft = structuredClone(learningSettings(note().subject));
  showModal(
    "문제 생성 설정",
    `<p class="desk-hint">현재는 노트의 제목과 본문을 이용한 연습 문제를 만듭니다. AI 심화 출제는 연결 전이며, 서술형은 해설을 보고 직접 확인합니다.</p>${learningFields(ui.newLearningDraft, "new-learning")}<p class="desk-hint">범위는 단원 제목 또는 p.1-5처럼 입력하세요. 비워두면 전체입니다.</p><p id="ws-question-error" class="form-error" role="alert"></p>`,
    btn("취소", "close-modal", "btn secondary") +
      btn("문제 만들기", "ws-generate-questions", "btn primary"),
  );
}
function questionBlocks(n, range) {
  const eligible = n.blocks.filter(
    (b) => b.title && workspaceText(b.html).trim().length >= 20,
  );
  if (!range.trim()) return eligible;
  const page = range
    .trim()
    .match(/^(?:p\.?\s*|페이지\s*)(\d+)\s*(?:[-~–]\s*(\d+))?$/i);
  if (page) {
    const from = Number(page[1]),
      to = Number(page[2] || page[1]);
    return eligible.filter((b) => b.page >= from && b.page <= to);
  }
  return eligible.filter((b) =>
    (b.title + " " + (b.chapter || ""))
      .toLowerCase()
      .includes(range.trim().toLowerCase()),
  );
}
function buildQuestions(n, settings) {
  const blocks = questionBlocks(n, settings.examRange),
    types = settings.problemTypes;
  const count = Math.max(0, Math.min(settings.questionCount, 100));
  const result = [];
  for (let i = 0; i < Math.min(count, blocks.length * types.length); i++) {
    const block = blocks[i % blocks.length],
      type =
        types[
          ((i % blocks.length) + Math.floor(i / blocks.length)) % types.length
        ];
    const excerpt = workspaceText(block.html)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 400),
      q = {
        id: uid(),
        type,
        blockId: block.id,
        chapter: block.chapter || block.title,
        explanation: excerpt,
      };
    const related =
      blocks.find((b) => b.id !== block.id && b.chapter !== block.chapter) ||
      blocks.find((b) => b.id !== block.id);
    const context =
      settings.chapterMode === "챕터 융합" && related
        ? `\n함께 연결할 개념: ${related.title}`
        : "";
    if (context) {
      q.relatedBlockId = related.id;
      q.explanation +=
        "\n연결할 내용: " + workspaceText(related.html).slice(0, 220);
    }
    if (type === "OX") {
      const falseCase = i % 2 === 1 && related;
      q.prompt = `다음 설명은 ‘${falseCase ? related.title : block.title}’에 해당한다.\n\n${excerpt}${context}`;
      q.options = ["O", "X"];
      q.correct = falseCase ? "X" : "O";
    } else if (type === "객관식") {
      q.prompt = `다음 설명에 가장 알맞은 개념을 고르세요.\n\n${excerpt}${context}`;
      const alternatives = [
        ...new Set(
          n.blocks
            .filter((b) => b.title && b.title !== block.title)
            .map((b) => b.title),
        ),
      ].slice(0, settings.questionDifficulty === "기초" ? 2 : 3);
      q.options = [block.title, ...alternatives];
      const rotate = i % q.options.length;
      q.options = [...q.options.slice(rotate), ...q.options.slice(0, rotate)];
      q.correct = block.title;
      if (q.options.length < 2) {
        q.type = "단답형";
        q.prompt = `설명에 해당하는 제목이나 핵심 개념을 적으세요.\n\n${excerpt}`;
        delete q.options;
      }
    } else if (type === "단답형") {
      q.prompt = `설명에 해당하는 노트의 제목을 적으세요.\n\n${excerpt}${context}`;
      q.correct = block.title;
    } else {
      q.prompt = context
        ? `‘${block.title}’와 ‘${related.title}’를 연결해 설명하세요.`
        : `‘${block.title}’의 ${settings.questionDifficulty === "심화" ? "적용 조건과 한계" : settings.questionDifficulty === "시험 수준" ? "핵심 원리와 주의할 점" : "핵심 내용"}을 자신의 말로 설명하세요.`;
      q.correct = excerpt;
      q.selfGrade = true;
    }
    result.push(q);
  }
  return result;
}
function practiceSession(set) {
  const wrong = set.questions.filter((q) => set.wrong?.[q.id]);
  const graded = set.questions.filter(
      (q) => set.results?.[q.id] === true || set.results?.[q.id] === false,
    ),
    right = graded.filter((q) => set.results[q.id] === true).length;
  const questions = ui.onlyWrong ? wrong : set.questions;
  return `<div class="practice-session-head"><div><h2>${esc(set.name)}</h2><p>${set.questions.length}문제 · ${esc(set.settings.examRange || "전체 범위")}</p></div>${btn("세트 목록", "ws-set-list", "btn ghost")}</div>${set.submitted ? `<div class="practice-result"><strong>${right} / ${graded.length} 정답</strong><span>${graded.length < set.questions.length ? "서술형을 확인하면 점수에 반영돼요." : "채점 완료"} · 오답 ${wrong.length}개</span>${btn(ui.onlyWrong ? "전체 보기" : "오답만 보기", "ws-wrong-filter", "btn secondary")}${wrong.length ? btn("오답 다시 풀기", "ws-retry-wrong", "btn secondary") : ""}</div>` : ""}<div class="practice-questions">${questions.map((q, index) => `<article class="practice-question"><div class="question-label"><span>${index + 1}. ${q.type === "주관식" ? "서술형" : esc(q.type)}</span>${set.submitted ? `<span class="${set.results?.[q.id] === false ? "wrong-answer" : "correct-answer"}">${set.results?.[q.id] === true ? "정답" : set.results?.[q.id] === false ? "오답" : "직접 확인"}</span>` : ""}</div><p class="question-prompt">${esc(q.prompt)}</p>${q.options ? `<div class="answer-options">${q.options.map((answer, i) => `<label><input type="radio" name="answer-${q.id}" data-answer="${q.id}" value="${esc(answer)}" ${set.answers[q.id] === answer ? "checked" : ""} ${set.submitted ? "disabled" : ""}><span>${q.type === "OX" ? "" : i + 1 + ". "}${esc(answer)}</span></label>`).join("")}</div>` : `<label class="form-field"><span class="sr-only">${index + 1}번 답안</span><textarea data-answer="${q.id}" rows="${q.selfGrade ? 3 : 1}" ${set.submitted ? "readonly" : ""} placeholder="답안을 입력하세요">${esc(set.answers[q.id] || "")}</textarea></label>`}${set.submitted ? `<div class="question-explanation"><strong>${q.selfGrade ? "참고 해설" : "정답: " + esc(q.correct)}</strong><p>${esc(q.explanation)}</p>${q.selfGrade ? `<div class="desk-inline-actions">${btn("이해했어요", "ws-self-grade", "btn secondary", `data-id="${q.id}" data-correct="true"`)}${btn("다시 공부할래요", "ws-self-grade", "btn secondary", `data-id="${q.id}" data-correct="false"`)}</div>` : ""}${q.type === "단답형" ? "<small>노트 제목과 일치하는지 확인한 결과입니다. 같은 뜻의 답이라면 직접 정답 처리할 수 있어요.</small>" + btn("정답으로 인정", "ws-self-grade", "text-button", `data-id="${q.id}" data-correct="true"`) : ""}<div class="question-source">${btn("관련 노트 보기", "ws-question-source", "text-button", `data-id="${q.blockId}"`)}${q.relatedBlockId ? btn("연결 개념 보기", "ws-question-source", "text-button", `data-id="${q.relatedBlockId}"`) : ""}<label><input type="checkbox" data-wrong="${q.id}" ${set.wrong?.[q.id] ? "checked" : ""}>오답으로 표시</label></div></div>` : ""}</article>`).join("") || '<p class="desk-hint">표시할 오답이 없어요.</p>'}</div>${!set.submitted ? `<div class="practice-submit"><p id="ws-answer-error" role="alert"></p>${btn("제출하고 확인하기", "ws-submit-answers", "btn primary")}</div>` : ""}`;
}
function currentProblemSet() {
  return note()?.problemSets?.find((s) => s.id === ui.activeSetId);
}
function gradeProblemSet(set) {
  set.results = {};
  set.wrong = {};
  const normalize = (s) =>
    String(s || "")
      .normalize("NFKC")
      .replace(/[\s.,!?·:()]/g, "")
      .toLowerCase();
  for (const q of set.questions) {
    if (q.selfGrade) set.results[q.id] = null;
    else {
      set.results[q.id] = normalize(set.answers[q.id]) === normalize(q.correct);
      set.wrong[q.id] = !set.results[q.id];
    }
  }
  set.submitted = true;
  set.submittedAt = new Date().toISOString();
}
function workspaceMaterialsModal() {
  const n = note();
  showModal(
    "노트 자료",
    `<div class="desk-inline-actions">${btn("자료 추가", "ws-append", "btn secondary")}${btn("수업 필기 관리", "class-notes", "btn secondary")}</div><div class="desk-material-list">${(n.materials || []).map((m) => `<article><div><strong>${esc(m.name)}</strong><small>${esc(m.kind)}${m.sample ? " · 예시 자료" : ""}</small></div>${btn("열기", "ws-open-material", "text-button", `data-id="${m.id}"`)}${btn("삭제", "ws-delete-material", "text-button", `data-id="${m.id}"`)}</article>`).join("") || '<p class="desk-hint">등록된 자료가 없어요.</p>'}</div>${classNotesBar(n)}`,
    btn("닫기", "close-modal", "btn secondary"),
  );
}
function workspaceTransformModal() {
  showModal(
    "노트 전체 다듬기",
    `<p>수정 방향과 요청을 저장하고 블록별로 비교할 수 있습니다. 전체 본문을 새로 쓰는 AI 기능은 연결 전입니다.</p><div class="desk-visible-options">${["더 쉽게", "핵심만", "자세하게", "전공 심화"].map((t) => `<label><input type="radio" name="transform-mode" value="${t}" ${t === "더 쉽게" ? "checked" : ""}>${t}</label>`).join("")}</div><label class="form-field"><span>추가 요청</span><textarea id="ws-transform-prompt" rows="3">${esc(note().runSettings?.prompt || "")}</textarea></label>`,
    btn("요청 저장", "ws-save-transform", "btn primary"),
  );
}
function workspaceVisualModal() {
  ui.visualKind = "흐름도";
  showModal(
    "시각자료 구성",
    `<label class="form-field"><span>종류</span><select id="ws-visual-kind">${["흐름도", "마인드맵", "개념도", "구조도", "비교표"].map((t) => `<option>${t}</option>`).join("")}</select></label><p class="desk-hint">노트 제목을 배치한 초안입니다. 연결 관계와 내용을 확인하고 수정해 주세요.</p><div id="ws-visual-preview">${workspaceVisualHTML("흐름도")}</div>`,
    btn("취소", "close-modal", "btn secondary") +
      btn("블록으로 삽입", "ws-insert-visual", "btn primary"),
  );
}
function workspaceVisualHTML(kind) {
  const titles = note()
    .blocks.filter((b) => b.title)
    .slice(0, 6)
    .map((b) => b.title);
  if (kind === "비교표")
    return `<table><thead><tr><th>개념</th><th>비교할 특징</th></tr></thead><tbody>${titles.map((t) => `<tr><td>${esc(t)}</td><td>내용을 작성하세요.</td></tr>`).join("")}</tbody></table>`;
  return `<div class="note-diagram diagram-${kind === "흐름도" ? "flow" : "map"}"><strong>${esc(note().title)}</strong>${titles.map((t, i) => `<p>${kind === "흐름도" && i ? "↓ " : ""}${esc(t)}</p>`).join("")}</div>`;
}
function workspaceConfirm(kind, id, label) {
  ui.workspaceRemoval = { kind, id, noteId: note()?.id };
  showModal(
    "삭제 확인",
    `<p>${esc(label)}을 삭제할까요?</p><p class="desk-hint">이 기기의 목록에서 제거됩니다. 노트 메뉴의 실행 취소로 되돌릴 수 있습니다.</p>`,
    btn("취소", "close-modal", "btn secondary") +
      btn("삭제", "ws-confirm-remove", "btn danger"),
  );
}
function handleWorkspaceAction(action, el = {}) {
  if (handleDnaManagerAction(action, el)) return true;
  const n = note();
  if (
    ["outline", "ws-question-source"].includes(action) &&
    isSideNoteBlock(n?.blocks.find((b) => b.id === el.dataset.id) || {})
  ) {
    ui.railOpen = true;
    if (innerWidth <= 760) ui.detailsOpen = true;
    render();
  }
  switch (action) {
    case "home":
    case "ws-note":
      ui.view = "editor";
      ui.onlyWrong = false;
      render();
      return true;
    case "ws-dna-manager":
    case "dna":
    case "note-settings":
    case "class-dna":
      ui.view = "dna-manager";
      ui.detailsOpen = false;
      ui.railOpen = true;
      render();
      return true;
    case "templates":
    case "ws-library":
      libraryModal();
      return true;
    case "ws-details":
      ui.view = "dna-manager";
      render();
      return true;
    case "ws-rail":
      if (innerWidth <= 760) {
        ui.detailsOpen = !ui.detailsOpen;
        ui.railOpen = true;
      } else ui.railOpen = ui.railOpen === false;
      render();
      return true;
    case "add-memo":
      ui.railOpen = true;
      if (innerWidth <= 760) ui.detailsOpen = true;
      return false;
    case "ws-practice":
      ui.view = "practice";
      ui.activeSetId = null;
      ui.onlyWrong = false;
      render();
      return true;
    case "ws-highlight": {
      const selection = ui.textSelection;
      if (!selection || !selection.range || !selection.container?.isConnected) {
        toast("강조할 문장을 먼저 드래그해 주세요.");
        return true;
      }
      try {
        snapshot();
        const mark = document.createElement("mark");
        mark.append(selection.range.extractContents());
        selection.range.insertNode(mark);
        const b = n.blocks.find((b) => b.id === selection.blockId);
        b.html = sanitize(selection.container.innerHTML);
        if (b.classGenerated) b.classEdited = true;
        changed();
        ui.textSelection = null;
        render();
      } catch {
        toast("한 블록 안에서 강조할 문장을 선택해 주세요.");
      }
      return true;
    }
    case "ws-block-request": {
      const block = n.blocks.find((b) => b.id === ui.selected);
      if (!block) return true;
      ui.requestBlockId = block.id;
      showModal(
        "선택한 내용에 요청",
        `<div class="desk-sample">${esc(ui.textSelection?.text || workspaceText(block.html).slice(0, 350))}</div><label class="form-field"><span>추가 요청</span><textarea id="ws-block-prompt" rows="4" maxlength="2000" placeholder="더 쉽게 설명하거나, 다른 출처로 보충해줘.">${esc(block.aiRequest || "")}</textarea></label><p class="desk-hint">요청은 이 블록에 저장됩니다. 실제 AI 수정과 외부 출처 재검색은 연결 전입니다. 기본 다듬기는 수정 전후를 비교할 수 있어요.</p>`,
        btn("요청 저장", "ws-save-block-request", "btn primary"),
      );
      return true;
    }
    case "ws-save-block-request": {
      const b = n.blocks.find((b) => b.id === ui.requestBlockId);
      if (b) b.aiRequest = $("#ws-block-prompt").value;
      save();
      closeModal();
      return true;
    }
    case "ws-note-menu":
      popover(
        el,
        `${item("자료와 필기", "ws-materials", "file")}${item("추가 요청·전체 다듬기", "ws-transform", "pen")}${item("시각자료 만들기", "ws-visual", "layout")}${item("DNA 관리", "ws-library", "grid")}${item("이전 상태 복구", "undo", "history")}${item("노트·DNA 파일 가져오기", "ws-import-package", "upload")}<input id="ws-package-file" type="file" accept=".json" hidden><div class="menu-divider"></div>${item("노트 삭제", "delete-note", "trash")}`,
      );
      return true;
    case "ws-template":
      snapshot();
      applyWorkspaceTemplate(el.dataset.id);
      save();
      render();
      return true;
    case "ws-save-template":
      if (!dnaIsDirty()) return true;
      templateSaveModal();
      return true;
    case "ws-edit-template":
      templateSaveModal(el.dataset.id);
      return true;
    case "ws-commit-template": {
      const name = $("#ws-template-name").value.trim();
      if (!name) {
        toast("DNA 이름을 입력해 주세요.");
        return true;
      }
      const previous = data.savedTemplates.find(
        (t) => t.id === ui.editTemplateId,
      );
      const capture = !previous || $("#ws-template-refresh")?.checked;
      const t = {
        ...(previous || {}),
        id: previous?.id || uid(),
        name,
        description: $("#ws-template-description").value.trim(),
        ...(capture
          ? {
              personal: structuredClone(personalSettings()),
              settings: structuredClone(subjectSettings(n.subject)),
              prompt: n.runSettings?.prompt || "",
              prompts: structuredClone(dnaPrompts()),
            }
          : {}),
        updated: new Date().toISOString(),
      };
      if (previous)
        data.savedTemplates[data.savedTemplates.indexOf(previous)] = t;
      else data.savedTemplates.push(t);
      if (capture) {
        n.activeTemplate = t.id;
        n.savedDnaSignature = dnaSignature(n);
        n.savedDnaId = t.id;
      }
      save();
      closeModal();
      render();
      toast("DNA를 저장했어요.");
      return true;
    }
    case "ws-library-tab":
      libraryModal(el.dataset.tab);
      return true;
    case "ws-library-preview":
      libraryPreview(el.dataset.id, el.dataset.kind);
      return true;
    case "ws-new-prompt":
      promptModal();
      return true;
    case "ws-edit-prompt":
      promptModal(el.dataset.id);
      return true;
    case "ws-commit-prompt": {
      const name = $("#ws-prompt-name").value.trim(),
        text = $("#ws-prompt-text").value.trim();
      if (!name || !text) {
        toast("이름과 요청 내용을 입력해 주세요.");
        return true;
      }
      const old = dnaPrompts().find((p) => p.id === ui.editPromptId),
        p = {
          id: old?.id || uid(),
          name,
          text,
          updated: new Date().toISOString(),
        };
      if (old) dnaPrompts()[dnaPrompts().indexOf(old)] = p;
      else dnaPrompts().push(p);
      workspaceSettingsChanged("subject");
      save();
      libraryModal("prompts");
      return true;
    }
    case "ws-use-library-item": {
      const { id, kind } = ui.libraryItem;
      if (kind === "community") {
        const t = [...communitySamples(), ...data.communityItems].find(
          (t) => t.id === id,
        );
        if (t.kind === "prompt")
          dnaPrompts().push({ id: uid(), name: t.name, text: t.text });
        else data.savedTemplates.push({ ...structuredClone(t), id: uid() });
        data.communityImports ||= {};
        data.communityImports[id] = (data.communityImports[id] || 0) + 1;
        save();
        libraryModal(t.kind === "prompt" ? "prompts" : "templates");
        toast("내 보관함에 가져왔어요.");
      } else {
        if (kind === "templates") applyWorkspaceTemplate(id);
        else {
          const p = dnaPrompts().find((p) => p.id === id);
          n.runSettings = { ...n.runSettings, prompt: p.text };
          workspaceSettingsChanged("subject");
        }
        save();
        closeModal();
        render();
        toast("이 노트에 적용했어요.");
      }
      return true;
    }
    case "ws-library-delete":
      workspaceConfirm(el.dataset.kind, el.dataset.id, "저장한 항목");
      return true;
    case "ws-like": {
      const id = el.dataset.id;
      data.communityLikes = data.communityLikes.includes(id)
        ? data.communityLikes.filter((x) => x !== id)
        : [...data.communityLikes, id];
      save();
      $("#ws-library-results").innerHTML = libraryResults(
        "community",
        $("#ws-library-search").value,
        $("#ws-community-sort").value,
      );
      return true;
    }
    case "ws-share-library": {
      const { id, kind } = ui.libraryItem,
        t = (kind === "templates" ? data.savedTemplates : dnaPrompts()).find(
          (x) => x.id === id,
        );
      showModal(
        "DNA·프롬프트 공유",
        `<h3>${esc(t.name)}</h3><p>${esc(t.description || t.text || "")}</p><label class="form-field"><span>과목·전공</span><input id="ws-publish-subject" value="${esc(n?.subject || "공통")}" maxlength="80"></label><label class="form-field"><span>학습 목적</span><input id="ws-publish-purpose" placeholder="예: 시험 대비" maxlength="80"></label><p class="desk-hint">공유 파일은 다른 사람에게 전달할 수 있어요. 커뮤니티 등록은 온라인 공개 없이 이 기기에서만 미리봅니다.</p>`,
        btn("공유 파일 내려받기", "ws-download-library", "btn primary") +
          btn("커뮤니티 등록 미리보기", "ws-publish-local", "btn secondary"),
      );
      return true;
    }
    case "ws-download-library":
    case "ws-publish-local": {
      const { id, kind } = ui.libraryItem,
        t = (kind === "templates" ? data.savedTemplates : dnaPrompts()).find(
          (x) => x.id === id,
        );
      if (action === "ws-download-library")
        download(
          safeName(t.name) + ".note-dna.json",
          JSON.stringify(
            {
              format: "note-dna-package",
              version: 1,
              kind: kind === "templates" ? "template" : "prompt",
              item: t,
            },
            null,
            2,
          ),
          "application/json",
        );
      else {
        data.communityItems.push({
          ...structuredClone(t),
          id: uid(),
          kind: kind === "templates" ? "template" : "prompt",
          author: "나 · 이 기기",
          subject: $("#ws-publish-subject").value,
          purpose: $("#ws-publish-purpose").value,
          date: new Date().toISOString(),
          likes: 0,
          imports: 0,
        });
        save();
        libraryModal("community");
      }
      return true;
    }
    case "ws-share":
    case "export-menu":
      noteShareModal();
      return true;
    case "ws-export": {
      const options = {
          sources: $("#ws-export-sources").checked,
          professor: $("#ws-export-professor").checked,
          memos: $("#ws-export-memos").checked,
        },
        out = buildWorkspaceExport(options),
        format = el.dataset.format;
      if (format === "md")
        download(
          safeName(n.title) + ".md",
          out.markdown,
          "text/markdown;charset=utf-8",
        );
      else if (format === "json") {
        const safeBlocks = out.blocks.map((b) => ({
          id: b.id,
          title: b.title,
          type: b.type,
          html: b.html,
          formula: b.formula,
          priority: b.priority,
          ...(options.sources
            ? {
                source: b.source,
                originFile: b.originFile,
                page: b.page,
                sourceName: b.sourceName,
              }
            : { source: "memo" }),
        }));
        download(
          safeName(n.title) + ".note-dna.json",
          JSON.stringify(
            {
              format: "note-dna-package",
              version: 1,
              kind: "note",
              item: { title: n.title, subject: n.subject, blocks: safeBlocks },
            },
            null,
            2,
          ),
          "application/json",
        );
      } else {
        const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>${esc(n.title)}</title><style>body{max-width:800px;margin:48px auto;padding:24px;font:16px/1.9 sans-serif;color:#252b36}section{margin:32px 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}small{color:#727b89}img{max-width:100%}</style>${out.html}</html>`;
        if (format === "html")
          download(
            safeName(n.title) + ".html",
            html,
            "text/html;charset=utf-8",
          );
        else {
          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            toast("인쇄 창을 열 수 없어요. 팝업 허용을 확인해 주세요.");
            return true;
          }
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 300);
        }
      }
      return true;
    }
    case "ws-import-package": {
      let input = $("#ws-package-file");
      if (!input) {
        const wrapper = document.createElement("input");
        wrapper.type = "file";
        wrapper.id = "ws-package-file";
        wrapper.accept = ".json";
        wrapper.hidden = true;
        document.body.append(wrapper);
        input = wrapper;
      }
      input.click();
      return true;
    }
    case "ws-confirm-import":
      commitWorkspaceImport();
      return true;
    case "ws-materials":
      workspaceMaterialsModal();
      return true;
    case "ws-append":
      workspaceCreateModal(true);
      return true;
    case "ws-remove-picked":
      ui.creation.files = ui.creation.files.filter(
        (f) => f.id !== el.dataset.id,
      );
      workspacePickFiles([]);
      return true;
    case "block-source":
    case "evidence-original": {
      const block = n?.blocks.find(
        (b) => b.id === (el.dataset?.block || ui.selected),
      );
      if (block) {
        ui.selected = block.id;
        const material = n.materials?.find(
          (m) => m.id === block.materialId || m.name === block.originFile,
        );
        if (material?.fileKey) {
          ui.page = block.page || 1;
          void showActualSource(material);
          return true;
        }
      }
      return false;
    }
    case "ws-open-material": {
      const m = n.materials.find((m) => m.id === el.dataset.id);
      if (m.fileKey) void showActualSource(m);
      else if (m.sample) {
        closeModal();
        ui.sourceOpen = true;
        ui.view = "editor";
        render();
      } else toast("이 기기에 원본 파일이 없어요.");
      return true;
    }
    case "ws-delete-material":
      workspaceConfirm("material", el.dataset.id, "원본 자료");
      return true;
    case "ws-delete-set":
      workspaceConfirm("problem", el.dataset.id, "문제 세트와 풀이 기록");
      return true;
    case "ws-confirm-remove": {
      const task = ui.workspaceRemoval,
        target = data.notes.find((n) => n.id === task.noteId);
      snapshot();
      if (task.kind === "material") {
        target.materials = target.materials.filter((m) => m.id !== task.id);
        if (
          target.fileKey &&
          !target.materials.some((m) => m.fileKey === target.fileKey)
        ) {
          target.fileKey = target.materials[0]?.fileKey || null;
          target.file = target.materials[0]?.name || "";
        }
      } else if (task.kind === "problem") {
        target.problemSets = target.problemSets.filter((s) => s.id !== task.id);
        if (ui.activeSetId === task.id) ui.activeSetId = null;
      } else if (task.kind === "templates")
        data.savedTemplates = data.savedTemplates.filter(
          (t) => t.id !== task.id,
        );
      else if (task.kind === "prompts")
        note().dnaPrompts = dnaPrompts().filter((p) => p.id !== task.id);
      save();
      closeModal();
      render();
      toast("목록에서 삭제했어요. 실행 취소로 복원할 수 있습니다.");
      return true;
    }
    case "ws-origin":
      showModal(
        "이 노트의 생성 설정",
        workspaceGenerationSummary(n),
        btn("닫기", "close-modal", "btn secondary"),
      );
      return true;
    case "ws-transform":
      workspaceTransformModal();
      return true;
    case "ws-save-transform":
      n.runSettings = {
        ...n.runSettings,
        prompt: $("#ws-transform-prompt").value,
        transformMode: $('input[name="transform-mode"]:checked').value,
      };
      save();
      closeModal();
      toast("변환 방향과 요청을 저장했어요. AI 연결 후 사용할 수 있습니다.");
      return true;
    case "ws-visual":
      workspaceVisualModal();
      return true;
    case "ws-insert-visual":
      snapshot();
      n.blocks.push({
        id: uid(),
        title: ui.visualKind + " 초안",
        type: "diagram",
        visualKind: ui.visualKind,
        source: "memo",
        priority: 1,
        html: workspaceVisualHTML(ui.visualKind),
      });
      changed();
      closeModal();
      render();
      return true;
    case "ws-reset-dna":
      showModal(
        "DNA 기본값 복원",
        "<p>사용자 DNA와 현재 노트 DNA를 추천값으로 복원합니다. 본문과 저장한 DNA은 유지됩니다.</p>",
        btn("취소", "close-modal", "btn secondary") +
          btn("복원", "ws-confirm-reset", "btn primary"),
      );
      return true;
    case "ws-confirm-reset":
      snapshot();
      data.personalDNA = structuredClone(personalDefaults);
      data.subjectDNA[n.subject] = structuredClone(subjectDefaults);
      n.activeTemplate = "개념 이해";
      save();
      closeModal();
      render();
      return true;
    case "ws-reset-history":
      snapshot();
      data.history = data.history.filter((h) => h.subject !== n.subject);
      delete data.recommendationDecisions[n.subject];
      save();
      render();
      return true;
    case "ws-habit-ignore":
      data.workspaceHabitDismissed ||= {};
      data.workspaceHabitDismissed[n.id] = data.history.length;
      save();
      closeModal();
      render();
      return true;
    case "ws-habit-apply":
      closeModal();
      data.subjectDNA[n.subject] = {
        ...subjectSettings(n.subject),
        length: "핵심만 간단히",
      };
      save();
      render();
      return true;
    case "ws-question-settings":
      questionSettingsModal();
      return true;
    case "ws-generate-questions": {
      const settings = structuredClone(ui.newLearningDraft),
        questions = buildQuestions(n, settings);
      if (!questions.length) {
        $("#ws-question-error").textContent =
          "선택한 범위에 충분한 본문이 없거나 문제 개수가 0입니다. 범위와 개수를 확인해 주세요.";
        return true;
      }
      const set = {
        id: uid(),
        name: dateLabel(new Date()) + " 연습",
        settings,
        questions,
        answers: {},
        results: {},
        wrong: {},
        createdAt: new Date().toISOString(),
      };
      n.problemSets ||= [];
      n.problemSets.unshift(set);
      data.learningDNA[n.subject] = settings;
      ui.activeSetId = set.id;
      ui.onlyWrong = false;
      ui.view = "practice";
      save();
      closeModal();
      render();
      if (questions.length < settings.questionCount)
        toast(
          "본문에서 만들 수 있는 " + questions.length + "문제를 준비했어요.",
        );
      return true;
    }
    case "ws-open-set":
      ui.activeSetId = el.dataset.id;
      ui.onlyWrong = false;
      render();
      return true;
    case "ws-set-list":
      ui.activeSetId = null;
      ui.onlyWrong = false;
      render();
      return true;
    case "ws-submit-answers": {
      const set = currentProblemSet();
      if (set.questions.some((q) => !String(set.answers[q.id] || "").trim())) {
        $("#ws-answer-error").textContent = "아직 답하지 않은 문제가 있어요.";
        return true;
      }
      gradeProblemSet(set);
      save();
      render();
      return true;
    }
    case "ws-self-grade": {
      const set = currentProblemSet(),
        correct = el.dataset.correct === "true";
      set.results[el.dataset.id] = correct;
      set.wrong[el.dataset.id] = !correct;
      save();
      render();
      return true;
    }
    case "ws-wrong-filter":
      ui.onlyWrong = !ui.onlyWrong;
      render();
      return true;
    case "ws-retry-wrong": {
      const set = currentProblemSet(),
        questions = set.questions.filter((q) => set.wrong[q.id]);
      if (!questions.length) return true;
      const retry = {
        ...structuredClone(set),
        id: uid(),
        name: set.name + " · 오답 복습",
        questions: structuredClone(questions),
        answers: {},
        results: {},
        wrong: {},
        submitted: false,
      };
      n.problemSets.unshift(retry);
      ui.activeSetId = retry.id;
      ui.onlyWrong = false;
      save();
      render();
      return true;
    }
    case "ws-question-source":
      ui.view = "editor";
      ui.selected = el.dataset.id;
      render();
      $("#block-" + CSS.escape(el.dataset.id))?.scrollIntoView({
        block: "center",
      });
      return true;
    case "duplicate-note":
      toast(
        "과목당 하나의 노트를 사용해요. 공유 파일로 사본을 보관할 수 있습니다.",
      );
      return true;
    case "sample-note":
      closeModal();
      if (data.notes[0]) openNote(data.notes[0].id);
      return true;
    default:
      return false;
  }
}
function validateWorkspacePackage(value) {
  if (
    !value ||
    value.format !== "note-dna-package" ||
    value.version !== 1 ||
    !["template", "prompt", "note"].includes(value.kind) ||
    !value.item
  )
    throw new Error("Note DNA 공유 파일이 아닙니다.");
  const v = value.item;
  if (value.kind === "note") {
    if (
      typeof v.title !== "string" ||
      typeof v.subject !== "string" ||
      !v.subject.trim() ||
      !v.title.trim() ||
      !Array.isArray(v.blocks) ||
      v.blocks.length > 500
    )
      throw new Error("노트 형식이 올바르지 않습니다.");
    return {
      kind: "note",
      item: {
        title: v.title.slice(0, 150),
        subject: v.subject.slice(0, 80),
        blocks: v.blocks.map((b) => ({
          id: uid(),
          title: String(b.title || "").slice(0, 150),
          type: ["memo", "text", "formula", "callout", "diagram"].includes(
            b.type,
          )
            ? b.type
            : "text",
          source: [
            "memo",
            "class-notes",
            "original",
            "external",
            "professor",
          ].includes(b.source)
            ? b.source
            : "memo",
          html: sanitize(String(b.html || "")),
          formula: String(b.formula || ""),
          priority: Math.max(1, Math.min(3, Number(b.priority) || 1)),
          page: Number(b.page) || 1,
          originFile: String(b.originFile || ""),
          sourceName: String(b.sourceName || ""),
        })),
      },
    };
  }
  if (typeof v.name !== "string" || !v.name.trim())
    throw new Error("이름이 없는 파일입니다.");
  if (value.kind === "prompt") {
    if (typeof v.text !== "string") throw new Error("요청문이 없습니다.");
    return {
      kind: "prompt",
      item: {
        id: uid(),
        name: v.name.slice(0, 80),
        text: v.text.slice(0, 2000),
      },
    };
  }
  const sanitizePrefs = (source, defaults) =>
    Object.fromEntries(
      Object.entries(defaults).map(([k, d]) => {
        const x = source?.[k];
        return [
          k,
          typeof d === "number" && Number.isFinite(x)
            ? Math.max(0, Math.min(10, x))
            : typeof d === "boolean" && typeof x === "boolean"
              ? x
              : Array.isArray(d) && Array.isArray(x)
                ? x.filter((y) => typeof y === "string").slice(0, 10)
                : typeof d === "string" && typeof x === "string"
                  ? x.slice(0, 150)
                  : structuredClone(d),
        ];
      }),
    );
  return {
    kind: "template",
    item: {
      id: uid(),
      name: v.name.slice(0, 80),
      description: String(v.description || "").slice(0, 500),
      personal: sanitizePrefs(v.personal, personalDefaults),
      settings: sanitizePrefs(v.settings, subjectDefaults),
      prompt: String(v.prompt || "").slice(0, 2000),
      prompts: Array.isArray(v.prompts)
        ? v.prompts
            .slice(0, 100)
            .filter(
              (p) =>
                p && typeof p.name === "string" && typeof p.text === "string",
            )
            .map((p) => ({
              id: uid(),
              name: p.name.slice(0, 80),
              text: p.text.slice(0, 2000),
            }))
        : [],
    },
  };
}
function commitWorkspaceImport() {
  const p = ui.importPackage;
  if (!p) return;
  if (p.kind === "note") {
    snapshot();
    const v = p.item,
      old = data.notes.find(
        (n) =>
          n.subject.trim().toLowerCase() === v.subject.trim().toLowerCase(),
      );
    if (old) {
      old.blocks.push(...v.blocks);
      old.updated = new Date().toISOString();
      ui.noteId = old.id;
    } else {
      const id = uid();
      data.notes.unshift({
        ...v,
        id,
        materials: [],
        classNotes: [],
        problemSets: [],
        sample: false,
        updated: new Date().toISOString(),
      });
      data.subjectDNA[v.subject] = structuredClone(subjectDefaults);
      ui.noteId = id;
    }
    ui.view = "editor";
  } else if (p.kind === "template") data.savedTemplates.push(p.item);
  else dnaPrompts().push(p.item);
  save();
  closeModal();
  render();
  toast("공유 파일을 가져왔어요.");
  ui.importPackage = null;
}
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.id === "desk-note-search") {
    ui.noteFilter = el.value;
    $("#desk-note-list").innerHTML = workspaceNoteLinks(el.value.toLowerCase());
  }
  if (el.id === "ws-library-search")
    $("#ws-library-results").innerHTML = libraryResults(
      ui.libraryTab,
      el.value,
      $("#ws-community-sort")?.value,
    );
  if (el.dataset.answer) {
    const set = currentProblemSet();
    if (set && !set.submitted) {
      set.answers[el.dataset.answer] = el.value;
      save();
    }
  }
});
document.addEventListener("change", async (e) => {
  const el = e.target;
  if (el.id === "ws-source-files") workspacePickFiles([...el.files]);
  if (el.dataset.fileKind) {
    const f = ui.creation?.files.find((f) => f.id === el.dataset.fileKind);
    if (f) f.kind = el.value;
  }
  if (el.id === "ws-create-saved-prompt") {
    const p = dnaPrompts().find((p) => p.id === el.value);
    if (p) $("#ws-create-prompt").value = p.text;
  }
  if (el.id === "ws-community-sort")
    $("#ws-library-results").innerHTML = libraryResults(
      "community",
      $("#ws-library-search").value,
      el.value,
    );
  if (el.dataset.answer) {
    const set = currentProblemSet();
    if (set && !set.submitted) {
      set.answers[el.dataset.answer] = el.value;
      save();
    }
  }
  if (el.dataset.wrong) {
    const set = currentProblemSet();
    if (set) {
      set.wrong[el.dataset.wrong] = el.checked;
      save();
    }
  }
  if (el.id === "ws-visual-kind") {
    ui.visualKind = el.value;
    $("#ws-visual-preview").innerHTML = workspaceVisualHTML(el.value);
  }
  if (el.id === "ws-package-file") {
    try {
      const file = el.files[0];
      if (!file) return;
      if (file.size > 3 * 1024 * 1024)
        throw new Error("공유 파일은 3MB 이하로 가져와 주세요.");
      ui.importPackage = validateWorkspacePackage(
        JSON.parse(await file.text()),
      );
      const p = ui.importPackage;
      showModal(
        "공유 파일 가져오기",
        `<h3>${esc(p.item.name || p.item.title)}</h3><p>${p.kind === "note" ? p.item.blocks.length + "개 블록을 가져옵니다. 같은 과목이 있으면 기존 노트에 이어 붙입니다." : p.kind === "template" ? "DNA를 내 보관함에 저장합니다." : "프롬프트를 내 보관함에 저장합니다."}</p>`,
        btn("취소", "close-modal", "btn secondary") +
          btn("가져오기", "ws-confirm-import", "btn primary"),
      );
    } catch (error) {
      toast(error.message || "공유 파일을 읽지 못했어요.");
    }
  }
});

function workspaceSettingsChanged(scope) {
  if (!["personal", "subject"].includes(scope) || !note()) return;
  note().activeTemplate = dnaIsDirty() ? "custom" : note().savedDnaId;
  refreshDnaSaveButton();
  refreshLiveDnaPreview();
  for (const button of document.querySelectorAll(
    '[data-action="ws-template"]',
  )) {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
    button.querySelector("svg")?.remove();
  }
}

document.addEventListener("mouseup", (e) => {
  const container = e.target.closest(".block-content"),
    selection = window.getSelection?.();
  if (!container || !selection?.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  if (container.contains(range.commonAncestorContainer))
    ui.textSelection = {
      blockId: container.closest(".note-block").dataset.block,
      container,
      range: range.cloneRange(),
      text: selection.toString(),
    };
});

function workspaceText(html) {
  return plain(
    String(html || " ")
      .replace(/<\/(?:p|div|li|tr|td|th|h[1-6])>/gi, "$&\n")
      .replace(/<br\s*\/?>/gi, "\n"),
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function workspaceGenerationSummary(n) {
  const d = n.generationSettings?.note || subjectSettings(n.subject);
  const p = n.generationSettings?.personal || personalSettings();
  const id = n.generationSettings?.template || n.activeTemplate;
  const name =
    data.savedTemplates.find((t) => t.id === id)?.name ||
    (modePresets[id] ? id : "직접 설정");
  const entries = [
    ["DNA", name],
    [
      "추가 요청",
      n.generationSettings?.prompt || n.runSettings?.prompt || "없음",
    ],
    ["자료", (n.materials || []).map((m) => m.name).join(", ") || "직접 작성"],
    ["문체", p.tone],
    ["단락 구분", d.headingStyle],
    ["정리 순서", d.organization],
    ["노트 분량", d.length],
    ["설명 수준", d.explanation],
    ["용어 설명", d.terminology],
    ["수식 설명", d.hasMath ? d.formula : "수식 없음"],
    [
      "예시",
      d.exampleTypes?.length
        ? d.exampleTypes.join(" · ") + " / 개념당 " + d.exampleCount + "개"
        : "없음",
    ],
    [
      "외부 설명",
      {
        lecture: "사용 안 함",
        balanced: "필요한 부분",
        deep: "넓게 보충",
        academic: "학술 심화",
      }[d.research],
    ],
    ["시각자료", d.visuals],
  ];
  return (
    '<dl class="desk-definition">' +
    entries
      .map(
        ([k, v]) =>
          "<dt>" + esc(k) + "</dt><dd>" + esc(v || "기본값") + "</dd>",
      )
      .join("") +
    "</dl>"
  );
}
function dnaPrompts(n = note()) {
  if (!n) return [];
  n.dnaPrompts ??= structuredClone(data.savedPrompts || []);
  return n.dnaPrompts;
}
function ensureDnaState(n) {
  dnaPrompts(n);
  n.savedDnaSignature ??= dnaSignature(n);
  n.savedDnaId ??= n.activeTemplate;
}
function dnaSignature(n = note()) {
  return JSON.stringify({
    personal: personalSettings(),
    settings: subjectSettings(n.subject),
    prompt: n.runSettings?.prompt || "",
    prompts: dnaPrompts(n),
  });
}
function dnaIsDirty() {
  return !!note() && dnaSignature() !== note().savedDnaSignature;
}
function refreshDnaSaveButton() {
  const catalog = $("#dna-catalog");
  if (catalog) catalog.innerHTML = dnaCatalog(ui.dnaQuery || "");
  const b = $('[data-action="ws-save-template"]');
  if (b) b.disabled = !dnaIsDirty();
  const status = $("#dna-change-status");
  if (status)
    status.textContent = dnaIsDirty()
      ? "변경한 설정은 현재 노트에 자동 저장됩니다. 새 DNA로 보관할 수 있어요."
      : "설정을 변경하면 새 DNA로 저장할 수 있어요.";
}
function dnaChoices() {
  return [
    ...Object.keys(modePresets).map((name) => ({
      id: name,
      name,
      builtin: true,
      description: modePresets[name].detail,
    })),
    ...data.savedTemplates,
  ];
}
function dnaCatalog(query = "") {
  const filtered = dnaChoices().filter((t) =>
    (t.name + " " + (t.description || ""))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return [
    [true, "기본 DNA"],
    [false, "사용자 지정 DNA"],
  ]
    .map(
      ([builtin, title]) =>
        `<section class="dna-catalog-group"><h2>${title}</h2><div class="dna-catalog-grid">${
          filtered
            .filter((t) => !!t.builtin === builtin)
            .map(
              (t) =>
                `<article class="dna-library-card ${note()?.activeTemplate === t.id && !dnaIsDirty() ? "selected" : ""}"><div class="dna-card-top"><strong>${esc(t.name)}</strong>${btn(icon("pin"), "dna-pin", "icon-button " + (data.pinnedDNA.includes(t.id) ? "is-pinned" : ""), `data-id="${esc(t.id)}" aria-label="${esc(t.name)} ${data.pinnedDNA.includes(t.id) ? "고정 해제" : "고정"}" aria-pressed="${data.pinnedDNA.includes(t.id)}"`)}</div><p>${esc(t.description || "나의 정리 방식과 프롬프트")}</p><div class="dna-card-actions">${btn(note()?.activeTemplate === t.id && !dnaIsDirty() ? "적용 중" : "이 노트에 적용", "ws-template", "btn secondary", `data-id="${esc(t.id)}" ${!note() ? "disabled" : ""}`)}${!t.builtin ? btn("관리", "dna-card-menu", "text-button", `data-id="${esc(t.id)}"`) : ""}</div></article>`,
            )
            .join("") ||
          '<p class="desk-hint">' +
            (query
              ? "검색 결과가 없어요."
              : "아래에서 설정을 바꾸고 나만의 DNA로 저장해 보세요.") +
            "</p>"
        }</div></section>`,
    )
    .join("");
}
function dnaManagerPage() {
  const n = note();
  return `<section class="dna-manager-page"><header class="dna-manager-heading"><span class="desk-eyebrow">나에게 맞는 정리 방식</span><h1>DNA 관리</h1><p>DNA를 선택하고 필요한 부분만 조절하세요. 핀을 걸면 노트 옆에서 바로 선택할 수 있어요.</p></header><label class="desk-search dna-catalog-search">${icon("search")}<input id="dna-catalog-query" aria-label="DNA 검색" placeholder="DNA 이름·설명 검색" value="${esc(ui.dnaQuery || "")}"></label><div id="dna-catalog">${dnaCatalog(ui.dnaQuery || "")}</div><div class="desk-inline-actions dna-library-tools">${btn("DNA 파일 가져오기", "ws-import-package", "text-button")}${btn("공유 DNA 둘러보기", "dna-community", "text-button")}</div>${n ? `<section class="dna-detail-section"><header class="dna-detail-heading"><div><h2>상세 설정</h2><p>${esc(n.title)}에 적용되는 DNA</p></div>${btn("현재 설정 DNA로 새로 저장", "ws-save-template", "btn primary", dnaIsDirty() ? "" : "disabled")}</header><p class="desk-hint" id="dna-change-status">${dnaIsDirty() ? "변경한 설정은 현재 노트에 자동 저장됩니다. 새 DNA로 보관할 수 있어요." : "설정을 변경하면 새 DNA로 저장할 수 있어요."}</p><div class="dna-manager-columns"><section class="dna-manager-settings"><h3>사용자 DNA <small>모든 노트에 적용</small></h3>${workspacePersonalFields()}</section><section class="dna-manager-settings"><div class="dna-note-heading"><h3>노트 DNA <small>${esc(n.title)}</small></h3>${btn("DNA 추천", "dna-recommend", "btn secondary")}</div>${workspaceNoteFields(subjectSettings(n.subject))}${advancedSettings("프롬프트", `<label class="form-field"><span>이 DNA의 프롬프트</span><textarea id="dna-prompt" rows="5" maxlength="2000" placeholder="예: 비슷한 개념은 비교표로 정리해줘.">${esc(n.runSettings?.prompt || "")}</textarea></label><p class="desk-hint">DNA를 저장하면 이 요청문과 보관함도 함께 저장돼요.</p><div class="desk-inline-actions">${btn("프롬프트 보관함", "dna-prompt-library", "btn secondary")}${btn("현재 프롬프트 보관", "ws-new-prompt", "text-button")}</div>`, "desk-dna")}</section></div>${advancedSettings("미리보기", `<div id="dna-preview">${liveDnaPreview()}</div><p class="desk-hint">현재 노트에 즉시 반영되는 표시입니다. 원문은 보존됩니다. 문체는 준비된 표현과 문장 배치를 반영하며, 새로운 설명·AI 문장 재작성은 연결 전입니다.</p>`, "desk-dna")}</section>` : `<div class="desk-hint">노트를 만들면 DNA를 적용하고 상세 설정을 조절할 수 있어요.</div>${btn("새 노트", "upload", "btn primary")}`}</section>`;
}
function handleDnaManagerAction(action, el) {
  if (action === "dna-read-more") {
    const block = el.closest(".note-block");
    block.classList.toggle("dna-show-full");
    el.textContent = block.classList.contains("dna-show-full")
      ? "핵심만 보기"
      : "전체 내용 보기";
    return true;
  }
  if (action === "dna-pin") {
    const id = el.dataset.id;
    data.pinnedDNA = data.pinnedDNA.includes(id)
      ? data.pinnedDNA.filter((v) => v !== id)
      : [...data.pinnedDNA, id];
    save();
    render();
    return true;
  }
  if (action === "dna-recommend") {
    showModal(
      "DNA 추천",
      workspaceSettingsManagement(),
      btn("닫기", "close-modal", "btn secondary"),
    );
    return true;
  }
  if (action === "dna-prompt-library") {
    libraryModal("prompts");
    return true;
  }
  if (action === "dna-community") {
    libraryModal("community");
    return true;
  }
  if (action === "dna-card-menu") {
    const id = esc(el.dataset.id);
    popover(
      el,
      btn("이름·설명 편집", "ws-edit-template", "", `data-id="${id}"`) +
        btn("공유", "dna-share-card", "", `data-id="${id}"`) +
        btn(
          "삭제",
          "ws-library-delete",
          "danger",
          `data-id="${id}" data-kind="templates"`,
        ),
    );
    return true;
  }
  if (action === "dna-share-card") {
    ui.libraryItem = { id: el.dataset.id, kind: "templates" };
    closePopover();
    handleWorkspaceAction("ws-share-library", el);
    return true;
  }
  return false;
}
document.addEventListener("input", (e) => {
  if (e.target.id === "dna-catalog-query") {
    ui.dnaQuery = e.target.value;
    $("#dna-catalog").innerHTML = dnaCatalog(ui.dnaQuery);
  }
  if (e.target.id === "dna-prompt") {
    note().runSettings = { ...note().runSettings, prompt: e.target.value };
    workspaceSettingsChanged("subject");
    save();
  }
});
function isExampleBlock(b) {
  return (
    b.type === "example" ||
    /예제|예시/.test(b.title || "") ||
    b.id === "analogy"
  );
}
function isSideNoteBlock(b) {
  return (
    b.type === "memo" ||
    (b.source === "memo" && b.type !== "diagram") ||
    isExampleBlock(b)
  );
}
function workspaceSideNotes() {
  const n = note(),
    d = dna(),
    examples = n.blocks.filter(isExampleBlock),
    memos = n.blocks.filter((b) => isSideNoteBlock(b) && !isExampleBlock(b));
  const extras = n.blocks.filter((b) => b.example && !isExampleBlock(b));
  const enabled = d.exampleTypes?.length > 0 && d.exampleCount > 0;
  return `<section class="desk-side-section" aria-label="예제"><h3>예제 <small>${examples.length + extras.length}</small></h3>${enabled ? examples.map((b, i) => blockHTML(b, i + 1)).join("") + extras.map((b) => `<details class="side-example"><summary>${esc(b.title || "연결 예제")}</summary><p>${esc(b.example)}</p>${btn("관련 본문", "outline", "text-button", `data-id="${esc(b.id)}"`)}</details>`).join("") || '<p class="desk-hint">등록된 예제가 없어요.</p>' : `<p class="desk-hint">현재 DNA에서는 예시를 표시하지 않아요.</p><details class="side-example"><summary>보관한 예제 보기</summary>${examples.map((b, i) => blockHTML(b, i + 1)).join("")}${extras.map((b) => `<p>${esc(b.example)}</p>`).join("")}</details>`}</section><section class="desk-side-section side-memos" aria-label="메모"><div class="side-section-heading"><h3>메모 <small>${memos.length}</small></h3>${btn(icon("plus") + "메모 추가", "add-memo", "text-button")}</div>${memos.map((b, i) => blockHTML(b, i + 1)).join("") || '<p class="desk-hint">본문을 읽으며 떠오른 생각을 기록하세요.</p>'}</section>`;
}
function dnaNumberToken(style, index) {
  if (style === "없음") return "";
  if (style === "•") return "•";
  if (style === "①") return String.fromCodePoint(0x2460 + ((index - 1) % 20));
  if (style === "a.") return String.fromCharCode(97 + ((index - 1) % 26)) + ".";
  if (style === "가.")
    return (
      [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바",
        "사",
        "아",
        "자",
        "차",
        "카",
        "타",
        "파",
        "하",
      ][(index - 1) % 14] + "."
    );
  return String(style || "1.").replace("1", String(index));
}
function dnaReadingHTML(b, d) {
  const box = document.createElement("div");
  box.innerHTML = sanitize(b.html);
  // Prepared alternatives are only used until the source is edited; custom notes retain their own wording.
  const seed = seedNotes
    .flatMap((n) => n.blocks)
    .find((original) => original.id === b.id);
  const prepared = b.dnaVariantOriginal !== false && seed?.html === b.html;
  if (prepared && d.tone === "간결한 노트체" && b.short)
    box.innerHTML = "<p>" + esc(b.short) + "</p>";
  else if (prepared && d.tone === "쉬운 설명체" && b.easy)
    box.innerHTML = "<p>" + esc(b.easy) + "</p>";
  else if (
    d.tone === "강의 필기체" &&
    box.children.length === 1 &&
    box.firstElementChild?.tagName === "P"
  ) {
    const parts = workspaceText(box.innerHTML)
      .split(/(?<=[.!?。])\s+/)
      .filter(Boolean);
    if (parts.length > 1)
      box.innerHTML =
        "<ul>" + parts.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>";
  }
  if (d.layoutPreference === "목록 중심")
    for (const table of [...box.querySelectorAll("table")]) {
      const rows = [...table.querySelectorAll("tr")],
        head = rows[0]?.querySelector("th")
          ? [...rows.shift().children].map((x) => x.textContent)
          : null;
      const list = document.createElement("ul");
      list.className = "dna-table-list";
      list.innerHTML = rows
        .map(
          (row) =>
            "<li>" +
            [...row.children]
              .map(
                (c, i) =>
                  (head
                    ? "<strong>" + esc(head[i] || "") + ":</strong> "
                    : "") + sanitize(c.innerHTML),
              )
              .join(" · ") +
            "</li>",
        )
        .join("");
      table.replaceWith(list);
    }
  if (d.layoutPreference === "표 중심")
    for (const list of [...box.querySelectorAll(":scope > ul,:scope > ol")]) {
      const table = document.createElement("table");
      table.innerHTML =
        "<thead><tr><th>순서</th><th>내용</th></tr></thead><tbody>" +
        [...list.children]
          .map(
            (li, i) =>
              "<tr><td>" +
              (i + 1) +
              "</td><td>" +
              sanitize(li.innerHTML) +
              "</td></tr>",
          )
          .join("") +
        "</tbody>";
      list.replaceWith(table);
    }
  for (const heading of box.querySelectorAll("h3,h4,h5,h6")) {
    if (d.headingStyle === "간단하게 2단계")
      heading.classList.add("dna-minor-heading");
  }
  for (const list of box.querySelectorAll("ol,ul")) {
    let level = 2,
      parent = list.parentElement;
    while (parent && parent !== box) {
      if (["OL", "UL"].includes(parent.tagName)) level++;
      parent = parent.parentElement;
    }
    list.classList.add("dna-numbered-list");
    [...list.children].forEach((li, i) => {
      li.setAttribute(
        "data-dna-number",
        dnaNumberToken(d["numberingLevel" + Math.min(level, 4)], i + 1),
      );
    });
  }
  const strong = [...box.querySelectorAll("strong,b")];
  strong.forEach((el, i) => {
    el.classList.add("dna-emphasis");
    if (d.emphasisAmount === "적게" && i > 0)
      el.classList.add("dna-deemphasized");
  });
  return box.innerHTML;
}
function dnaViewAttributes(d) {
  return `data-dna-emphasis="${esc(d.emphasisStyle)}" data-dna-amount="${esc(d.emphasisAmount)}" data-dna-length="${esc(d.length)}" data-dna-paragraphs="${esc(d.headingStyle)}"`;
}
function applyDnaPresentation() {
  if (!note() || ui.view !== "editor") return;
  const d = dna();
  const container = $(".desk-document");
  if (container) {
    container.dataset.dnaEmphasis = d.emphasisStyle;
    container.dataset.dnaAmount = d.emphasisAmount;
    container.dataset.dnaLength = d.length;
    container.dataset.dnaParagraphs = d.headingStyle;
  }
  let number = 0;
  for (const el of $$(".desk-document .note-block")) {
    const b = note().blocks.find((b) => b.id === el.dataset.block);
    if (!b) continue;
    const num = $(".section-number", el);
    if (num) num.textContent = dnaNumberToken(d.numberingLevel1, ++number);
    const original = $(".block-content", el);
    if (!original) continue;
    const html = dnaReadingHTML(b, d);
    let reading = $(".dna-reading-copy", el);
    if (!reading) {
      reading = document.createElement("div");
      reading.className = "dna-reading-copy";
      original.before(reading);
      original.classList.add("dna-original-content");
    }
    reading.innerHTML = html;
    let expand = $(".dna-read-more", el);
    if (d.length === "핵심만 간단히" && !expand) {
      expand = document.createElement("button");
      expand.className = "dna-read-more text-button";
      expand.dataset.action = "dna-read-more";
      expand.textContent = "전체 내용 보기";
      original.parentElement.append(expand);
    } else if (d.length !== "핵심만 간단히") expand?.remove();
  }
}
function liveDnaPreview() {
  if (!note()) return "";
  const d = dna(),
    blocks = note()
      .blocks.filter((b) => !isSideNoteBlock(b))
      .slice(0, 2);
  return `<div class="dna-live-preview" ${dnaViewAttributes(d)}><span class="desk-hint">${esc(note().title)} · 실제 본문 미리보기</span>${blocks.map((b, i) => `<section><h3>${esc(dnaNumberToken(d.numberingLevel1, i + 1))} ${esc(b.title || "본문")}</h3><div class="dna-reading-copy">${dnaReadingHTML(b, d)}</div></section>`).join("") || "<p>본문을 작성하면 적용된 모습을 볼 수 있어요.</p>"}</div>`;
}
function refreshLiveDnaPreview() {
  if ($("#dna-preview")) $("#dna-preview").innerHTML = liveDnaPreview();
  applyDnaPresentation();
}
document.addEventListener("input", (e) => {
  if (e.target.matches(".dna-original-content")) {
    const b = note()?.blocks.find(
      (b) => b.id === e.target.closest(".note-block").dataset.block,
    );
    if (b) {
      b.dnaVariantOriginal = false;
      const reading = e.target.parentElement.querySelector(".dna-reading-copy");
      if (reading)
        reading.innerHTML = dnaReadingHTML(
          { ...b, html: sanitize(e.target.innerHTML) },
          dna(),
        );
    }
  }
});
