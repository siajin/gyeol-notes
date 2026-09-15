"use strict";
// Per-lecture source notes and opt-in, evidence-based DNA recommendations.
const classWeightLabels = ["반영 안 함", "핵심만", "균형 있게", "가능한 모두"];
const classPriorityLabels = ["참고", "중요", "최우선"];
function classAttachments(n = note()) {
  return n?.classNotes || [];
}
function classNotesBar(n) {
  const attachments = classAttachments(n),
    ready = attachments.filter((a) => a.text?.trim()).length;
  return `<section class="class-notes-bar" aria-label="수업 필기 첨부 공간"><div class="class-notes-heading">${icon("pen")}<div><strong>수업 필기${attachments.length ? ` <span class="attachment-count">${attachments.length}</span>` : ""}</strong><p>${attachments.length ? `${ready}개 필기 반영 가능 · ${classWeightLabels[dna(n.subject).classWeight]} 반영` : "수업을 들으며 따로 적은 내용을 함께 정리하세요."}</p></div></div><div class="class-notes-actions">${btn(attachments.length ? "필기 관리" : icon("plus") + "필기 첨부", "class-notes", "btn secondary")}${attachments.length ? btn("정리에 반영", "class-stage", "btn primary") : ""}</div></section>`;
}
function classDNAControls(d) {
  return `<section class="class-dna-controls" aria-labelledby="class-dna-heading"><div class="control-label"><strong id="class-dna-heading">${icon("pen")} 수업 필기 반영</strong></div><p class="settings-help">강의 중 직접 적은 필기를 정리에 얼마나 담을지 정해요.</p><div class="control-group"><div class="control-label"><label for="class-weight">반영 정도</label><output id="class-weight-label">${classWeightLabels[d.classWeight]}</output></div><input id="class-weight" type="range" class="range" min="0" max="3" step="1" value="${d.classWeight}" aria-valuetext="${classWeightLabels[d.classWeight]}"><div class="range-labels"><span>반영 안 함</span><span>핵심만</span><span>균형 있게</span><span>가능한 모두</span></div></div><div class="control-group"><div class="control-label"><strong>필기의 중요도</strong><small>시험 모드에도 반영</small></div><div class="segmented">${classPriorityLabels.map((label, i) => btn(label, "class-priority", d.classPriority === i + 1 ? "selected" : "", `data-value="${i + 1}" aria-pressed="${d.classPriority === i + 1}"`)).join("")}</div></div><label class="check-row"><input type="checkbox" data-dna-check="classEmphasis" ${d.classEmphasis ? "checked" : ""}>‘시험’, ‘중요’처럼 강조한 필기 먼저 반영</label><p class="settings-help">원본 필기는 보관됩니다. 설정 저장 후 노트에서 ‘정리에 반영’을 눌러 확인하세요.</p></section>`;
}
function classDNAPreview(d) {
  const source = data.notes
    .filter((n) => ui.dnaSubject === "기본" || n.subject === ui.dnaSubject)
    .flatMap((n) => classAttachments(n))
    .find((a) => a.text?.trim());
  const example = source || {
    id: "example",
    name: "수업 필기 예시",
    text: "교수님 강조: 페이지 폴트 처리 후 중단된 명령을 다시 실행한다.\n시험에서는 FIFO와 LRU의 교체 순서를 비교한다.\n페이지 폴트 비율과 접근 시간의 관계를 복습하기.",
  };
  if (!d.classWeight)
    return '<div class="class-preview"><small>수업 필기 · 반영 안 함</small><p>첨부한 원본만 보관하고 정리 내용에는 포함하지 않아요.</p></div>';
  const block = buildClassBlocks([example], d)[0];
  return `<div class="class-preview"><small>${icon("pen")}${source ? "첨부한 수업 필기" : "수업 필기 예시"} · ${classPriorityLabels[d.classPriority - 1]}</small><div class="preview-body">${block?.html || ""}</div></div>`;
}
function refreshRecommendations() {
  if ($("#habit-recommendation"))
    $("#habit-recommendation").innerHTML = recommendationContent(
      ui.dnaSubject,
      ui.draft,
    );
}
function refreshClassDNA() {
  if ($("#class-weight-label"))
    $("#class-weight-label").textContent =
      classWeightLabels[ui.draft.classWeight];
  if ($("#class-weight"))
    $("#class-weight").setAttribute(
      "aria-valuetext",
      classWeightLabels[ui.draft.classWeight],
    );
  refreshDNAPreview();
}
function classNotesModal(editId = null) {
  const existing = classAttachments().find((a) => a.id === editId);
  ui.classEditId = existing?.id || null;
  ui.classFile = null;
  ui.classBusy = false;
  ui.classToken = uid();
  showModal(
    "수업 필기 첨부",
    `<div class="class-attachment-list">${classAttachments()
      .map(
        (a) =>
          `<div class="class-attachment-row">${icon("file")}<button data-action="class-edit" data-id="${esc(a.id)}"><strong>${esc(a.name)}</strong><small>${a.text?.trim() ? `${a.text.length.toLocaleString()}자 · 정리에 반영 가능` : "텍스트를 보완하면 정리에 반영할 수 있어요"}</small></button>${btn(icon("trash"), "class-remove", "icon-button", `data-id="${esc(a.id)}" aria-label="${esc(a.name)} 첨부 삭제"`)}</div>`,
      )
      .join(
        "",
      )}</div><label class="drop-zone class-drop-zone" id="class-drop-zone" tabindex="0">${icon("upload")}<strong>${existing ? "새 파일로 교체하거나 아래 내용을 수정하세요" : "필기 파일을 놓거나 눌러서 선택하세요"}</strong><small>TXT, Markdown, PDF, 이미지 · 최대 25MB</small><input id="class-file" type="file" accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp" hidden></label><p id="class-file-label" class="settings-help">${existing?.fileKey ? "원본 파일이 보관되어 있어요." : "파일 없이 텍스트만 붙여넣어도 됩니다."}</p>${existing?.fileKey ? btn("원본 필기 보기", "class-original", "btn ghost", `data-id="${esc(existing.id)}"`) : ""}<label class="form-field"><span>필기 제목</span><input id="class-title" maxlength="100" placeholder="예: 7주차 수업 중 필기" value="${esc(existing?.name || "")}"></label><label class="form-field"><span>정리에 반영할 필기 내용</span><textarea id="class-text" maxlength="50000" rows="7" placeholder="교수님이 강조한 내용, 추가 설명, 수업 중 적은 메모를 붙여넣으세요.">${esc(existing?.text || "")}</textarea></label><p class="upload-note">텍스트 파일은 바로 읽습니다. PDF·필기 사진의 자동 문자 인식은 연결 전이므로, 내용을 텍스트로 함께 입력하면 정리에 반영돼요.</p><p id="class-error" class="form-error" role="alert"></p>`,
    btn("닫기", "close-modal", "btn secondary") +
      btn(
        existing ? "필기 수정 저장" : "필기 첨부하기",
        "class-save",
        "btn primary",
      ),
    esc(note()?.title || "") + "에 연결되는 나의 수업 기록",
  );
}
async function selectClassFile(file) {
  if (!file) return;
  const error = $("#class-error");
  if (!/\.(txt|md|pdf|png|jpe?g|webp)$/i.test(file.name)) {
    error.textContent = "TXT, Markdown, PDF 또는 이미지 파일을 선택해 주세요.";
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    error.textContent = "25MB 이하의 파일을 선택해 주세요.";
    return;
  }
  const token = (ui.classToken = uid());
  ui.classBusy = true;
  ui.classFile = null;
  $('[data-action="class-save"]').disabled = true;
  error.textContent = "";
  try {
    const text = /\.(txt|md)$/i.test(file.name) ? await file.text() : null;
    if (token !== ui.classToken || !$("#class-text")) return;
    if (text !== null && text.length > 50000)
      throw new Error("필기 내용은 50,000자 이하로 나누어 첨부해 주세요.");
    ui.classFile = file;
    $("#class-title").value = file.name.replace(/\.[^.]+$/, "");
    $("#class-file-label").textContent =
      file.name +
      " · " +
      (text !== null ? "텍스트를 가져왔어요" : "텍스트를 함께 입력해 주세요");
    if (text !== null) $("#class-text").value = text;
  } catch (e) {
    if (token === ui.classToken && $("#class-error"))
      $("#class-error").textContent = e.message || "파일을 읽지 못했어요.";
  } finally {
    if (token === ui.classToken) {
      ui.classBusy = false;
      const submit = $('[data-action="class-save"]');
      if (submit) submit.disabled = false;
    }
  }
}
async function saveClassAttachment() {
  if (ui.classBusy) return;
  const n = note(),
    current = classAttachments(n).find((a) => a.id === ui.classEditId),
    file = ui.classFile;
  const text = $("#class-text").value.trim(),
    name = $("#class-title").value.trim() || file?.name || "수업 필기";
  if (!text && !file && !current?.fileKey) {
    $("#class-error").textContent =
      "필기 파일을 첨부하거나 내용을 입력해 주세요.";
    return;
  }
  if (text.length > 50000) {
    $("#class-error").textContent =
      "필기 내용은 50,000자 이내로 입력해 주세요.";
    return;
  }
  const submit = $('[data-action="class-save"]');
  submit.disabled = true;
  ui.classBusy = true;
  const token = ui.classToken,
    noteId = n.id;
  try {
    let fileKey = current?.fileKey || null;
    if (file) {
      fileKey = "class-" + uid();
      await storeFile(fileKey, file);
    }
    if (token !== ui.classToken || !$("#class-text") || !data.notes.includes(n))
      return;
    const a = {
      id: current?.id || uid(),
      name,
      text,
      fileKey,
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    snapshot();
    n.classNotes = classAttachments(n).filter((x) => x.id !== a.id);
    n.classNotes.push(a);
    n.updated = new Date().toISOString();
    if (!save()) {
      data = JSON.parse(undoStack.pop());
      throw new Error("저장 공간이 부족해 필기를 저장하지 못했어요.");
    }
    closeModal();
    openNote(noteId);
    toast(
      text
        ? "필기를 첨부했어요. ‘정리에 반영’에서 결과를 확인하세요."
        : "원본을 보관했어요. 필기 관리에서 텍스트를 보완해 주세요.",
    );
  } catch (e) {
    if ($("#class-error"))
      $("#class-error").textContent = e.message || "필기를 저장하지 못했어요.";
  } finally {
    if (token === ui.classToken) {
      ui.classBusy = false;
      if (submit.isConnected) submit.disabled = false;
    }
  }
}
function classChunks(text) {
  return text
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?。])\s+/)
    .map((s) => s.replace(/^\s*(?:#{1,6}\s+|[-*•]\s+|\d+[.)]\s+)/, "").trim())
    .filter(Boolean);
}
function buildClassBlocks(attachments, d) {
  if (!d.classWeight) return [];
  return attachments
    .filter((a) => a.text?.trim())
    .map((a) => {
      const chunks = classChunks(a.text),
        ratio = [0, 0.3, 0.65, 1][d.classWeight];
      const count = Math.max(1, Math.ceil(chunks.length * ratio));
      const emphasized = (s) => /[★⭐]|시험|중요|강조|반드시/.test(s);
      const selected = chunks
        .map((text, index) => ({
          text,
          index,
          rank: d.classEmphasis && emphasized(text) ? 1 : 0,
        }))
        .sort((a, b) => b.rank - a.rank || a.index - b.index)
        .slice(0, count)
        .sort((a, b) => a.index - b.index);
      const copy = selected.map((x) =>
        d.bold && emphasized(x.text)
          ? `<strong>${esc(x.text)}</strong>`
          : esc(x.text),
      );
      const html = d.formats.includes("글머리표")
        ? "<ul>" + copy.map((x) => `<li>${x}</li>`).join("") + "</ul>"
        : d.formats.includes("표")
          ? "<table><thead><tr><th>순서</th><th>수업 필기</th></tr></thead><tbody>" +
            copy
              .map((x, i) => `<tr><td>${i + 1}</td><td>${x}</td></tr>`)
              .join("") +
            "</tbody></table>"
          : copy.map((x) => `<p>${x}</p>`).join("");
      return {
        id: uid(),
        title: a.name + " · 필기 정리",
        html,
        type: "text",
        source: "class-notes",
        priority: d.classPriority,
        attachmentId: a.id,
        sourceName: a.name,
        sourceText: a.text,
        classGenerated: true,
        classEdited: false,
      };
    });
}
function planClassSync(n, d) {
  const protectedIds = new Set(
    n.blocks
      .filter((b) => b.classGenerated && b.classEdited)
      .map((b) => b.attachmentId),
  );
  const additions = buildClassBlocks(
    classAttachments(n).filter((a) => !protectedIds.has(a.id)),
    d,
  );
  const removals = n.blocks
    .filter(
      (b) =>
        b.classGenerated && !b.classEdited && !protectedIds.has(b.attachmentId),
    )
    .map((b) => b.id);
  return {
    additions,
    removals,
    protectedCount: protectedIds.size,
    pending: classAttachments(n).filter((a) => !a.text?.trim()).length,
  };
}
function stageClassSync() {
  const n = note(),
    d = dna(n.subject),
    plan = planClassSync(n, d);
  if (!plan.additions.length && !plan.removals.length) {
    toast(
      !d.classWeight
        ? "Note DNA에서 필기 반영 정도를 선택해 주세요."
        : plan.protectedCount
          ? "직접 수정한 필기 정리 블록은 보존돼요. 새 필기를 첨부하면 추가로 반영할 수 있어요."
          : "필기 관리에서 반영할 텍스트를 입력해 주세요.",
    );
    return;
  }
  ui.classPlan = { noteId: n.id, ...plan };
  showModal(
    "수업 필기로 정리하기",
    `<div class="class-sync-meta"><span>${classWeightLabels[d.classWeight]} 반영</span><span>${classPriorityLabels[d.classPriority - 1]}</span>${btn("DNA 설정", "class-dna", "btn ghost")}</div><p class="settings-help">${plan.additions.length}개 필기 정리 블록을 ${plan.removals.length ? "갱신" : "추가"}합니다.${plan.protectedCount ? ` 직접 수정한 ${plan.protectedCount}개 필기 정리는 보존됩니다.` : ""}${plan.pending ? ` 텍스트가 없는 첨부 ${plan.pending}개는 제외됩니다.` : ""}</p><div class="class-sync-preview">${plan.additions.map((b) => `<section><div class="source-label memo">${icon("pen")}수업 필기 · ${esc(b.sourceName)}</div><h3>${esc(b.title)}</h3><div class="compare-content">${sanitize(b.html)}</div></section>`).join("") || "<p>필기 반영이 꺼져 있어, 자동으로 만든 필기 정리 블록을 제거합니다.</p>"}</div><p class="upload-note">입력한 필기의 구절을 선택해 정리하는 미리보기입니다. 원본 필기와 직접 작성한 메모는 보관됩니다.</p>`,
    btn("취소", "close-modal", "btn secondary") +
      btn("노트에 반영", "class-apply", "btn primary"),
    "필기에서 선택한 구절과 출처를 확인하세요.",
  );
}
function applyClassSync() {
  const p = ui.classPlan,
    n = data.notes.find((n) => n.id === p?.noteId);
  if (!p || !n) return;
  snapshot();
  n.blocks = n.blocks.filter((b) => !p.removals.includes(b.id));
  n.blocks.push(...p.additions);
  n.updated = new Date().toISOString();
  save();
  closeModal();
  openNote(n.id);
  toast("필기 내용을 노트에 반영했어요.");
}
function classSourceModal(b) {
  const a = classAttachments().find((a) => a.id === b.attachmentId);
  showModal(
    esc(a?.name || b.sourceName || "수업 필기"),
    `<div class="class-source-text">${esc(a?.text || b.sourceText || "첨부된 필기를 찾을 수 없어요.")}</div>`,
    btn("닫기", "close-modal", "btn secondary") +
      (a
        ? btn(
            "첨부 필기 관리",
            "class-edit",
            "btn primary",
            `data-id="${esc(a.id)}"`,
          )
        : ""),
    "수업 중 직접 작성한 원본 필기" + (a ? "" : " · 정리 당시 보관한 내용"),
  );
}
// Collapse repeated edits to each block into a single before/after observation.
function habitStats(subject) {
  const events = data.history
    .filter(
      (h) =>
        h.subject === subject &&
        ["manual", "short", "easy", "long", "example"].includes(h.kind) &&
        Number.isFinite(h.before) &&
        Number.isFinite(h.after) &&
        h.before > 0 &&
        h.after >= 0,
    )
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const notes = new Map();
  for (const h of events) {
    const owner = h.noteId
      ? data.notes.find((n) => n.id === h.noteId && n.subject === subject)
      : data.notes.find(
          (n) =>
            n.subject === subject && n.blocks.some((b) => b.id === h.block),
        );
    const block = owner?.blocks.find((b) => b.id === h.block);
    if (
      !owner ||
      !block ||
      block.type === "memo" ||
      block.source === "class-notes"
    )
      continue;
    if (!notes.has(owner.id))
      notes.set(owner.id, {
        id: owner.id,
        blocks: new Map(),
        lastDate: h.date,
      });
    const entry = notes.get(owner.id),
      first = entry.blocks.get(h.block);
    entry.blocks.set(h.block, {
      before: first?.before ?? h.before,
      after: h.after,
      date: h.date,
    });
    entry.lastDate = h.date;
  }
  const recent = [...notes.values()]
    .map((n) => {
      const long = [...n.blocks.values()].filter(
        (b) => b.before >= 80 && b.after > 0,
      );
      const before = long.reduce((s, b) => s + b.before, 0),
        after = long.reduce((s, b) => s + b.after, 0);
      return {
        ...n,
        before,
        after,
        reduction: before ? (before - after) / before : 0,
      };
    })
    .filter((n) => n.before > 0)
    .sort((a, b) => String(b.lastDate).localeCompare(String(a.lastDate)))
    .slice(0, 5);
  return {
    count: recent.length,
    percent: recent.length
      ? Math.round(
          (recent.reduce((s, n) => s + n.reduction, 0) / recent.length) * 100,
        )
      : 0,
    fingerprint: JSON.stringify(
      recent.map((n) => [n.id, n.before, n.after, n.lastDate]),
    ),
  };
}
function habitRecommendation(subject, d = dna(subject)) {
  const stats = habitStats(subject);
  if (
    subject === "기본" ||
    !d.learn ||
    stats.count < 3 ||
    stats.percent < 20 ||
    d.density <= 1
  )
    return null;
  const token = subject + "|density|" + d.density + "|" + stats.fingerprint;
  if (data.recommendationDecisions?.[subject]?.token === token) return null;
  return { ...stats, token, subject, from: d.density, to: 1 };
}
function recommendationContent(subject, d) {
  const r = habitRecommendation(subject, d),
    stats = habitStats(subject),
    decision = data.recommendationDecisions?.[subject];
  if (!d.learn)
    return '<p class="settings-help">편집 습관 추천이 꺼져 있어요. 설정은 현재 값으로 유지됩니다.</p>';
  if (r)
    return `<div class="habit-proposal"><span class="habit-tag">나에게 맞는 설정 제안</span><p>최근 ${esc(subject)} 노트 <strong>${r.count}개</strong>에서 긴 설명을 평균 <strong>${r.percent}%</strong> 줄였어요.</p><p>설명량을 ‘${densityLabels[r.from - 1]}’에서 <strong>‘핵심만’</strong>으로 바꾸는 것을 추천합니다.</p><div class="habit-actions">${btn("적용", "habit-apply", "btn primary")}${btn("무시", "habit-ignore", "btn ghost")}</div><details class="habit-evidence"><summary>추천 기준 보기</summary><p>최근 수정한 과목 노트 최대 5개를 확인합니다. 같은 블록을 여러 번 수정한 경우 최초 길이와 마지막 길이를 비교하며, 긴 설명의 감소율을 노트별로 계산해 평균을 냅니다. 사용자 메모와 첨부 필기, 형식만 바꾼 편집은 제외합니다.</p></details></div>`;
  let message =
    subject === "기본"
      ? "과목별 탭에서 해당 수업의 편집 습관을 확인할 수 있어요."
      : decision?.status === "applied" && d.density === 1
        ? "추천한 ‘핵심만’ 설정을 적용했어요."
        : decision?.status === "ignored" &&
            decision.fingerprint === stats.fingerprint
          ? "이번 추천을 무시했어요. 새로운 편집 기록이 쌓이면 다시 살펴볼게요."
          : stats.count < 3
            ? `긴 설명을 수정한 ${esc(subject)} 노트가 ${stats.count}개 있어요. 3개 이상 쌓이면 최근 최대 5개를 분석해 추천합니다.`
            : "최근 편집 기록을 확인했어요. 현재 설정을 바꿀 만큼 일관된 변화는 아직 없어요.";
  return `<p class="settings-help">${message}</p><details class="habit-example"><summary>추천 예시 보기</summary><div class="habit-proposal"><span class="habit-tag">표시 예시 · 실제 편집 기록 아님</span><p>최근 운영체제 노트 5개에서 긴 설명을 평균 32% 줄였어요.</p><p>설명량을 ‘적당히’에서 ‘핵심만’으로 바꾸는 것을 추천합니다.</p><div class="habit-actions"><button class="btn primary" disabled>적용</button><button class="btn ghost" disabled>무시</button></div><small>실제 추천이 생기면 적용하거나 무시할 수 있어요.</small></div></details>`;
}
function habitPanel(subject, d) {
  return `<section class="habit-panel"><h3>${icon("history")} 편집 습관에서 발견했어요</h3><label class="check-row"><input type="checkbox" data-dna-check="learn" ${d.learn ? "checked" : ""}>내 편집 습관으로 설정 추천 받기</label><p class="settings-help">설정은 ‘적용’을 눌렀을 때만 바뀝니다.</p><div id="habit-recommendation">${recommendationContent(subject, d)}</div></section>`;
}
function decideRecommendation(status) {
  const r = habitRecommendation(ui.dnaSubject, ui.draft);
  if (!r) {
    refreshRecommendations();
    return;
  }
  snapshot();
  data.recommendationDecisions ||= {};
  data.recommendationDecisions[r.subject] = {
    token: r.token,
    fingerprint: r.fingerprint,
    status,
    at: new Date().toISOString(),
  };
  if (status === "applied") {
    ui.draft.density = r.to;
    data.dna[r.subject] = structuredClone(ui.draft);
  }
  save();
  render();
  toast(
    status === "applied"
      ? "설명량을 ‘핵심만’으로 바꿨어요."
      : "이번 추천을 무시했어요. 현재 설정을 유지합니다.",
  );
}
function handleStudyAction(action, el) {
  switch (action) {
    case "class-notes":
      classNotesModal();
      return true;
    case "class-edit":
      classNotesModal(el.dataset.id);
      return true;
    case "class-save":
      void saveClassAttachment();
      return true;
    case "class-original": {
      const attachment = classAttachments().find((a) => a.id === el.dataset.id);
      if (attachment?.fileKey) {
        ui.page = 1;
        void showActualSource({ fileKey: attachment.fileKey });
      }
      return true;
    }
    case "class-stage":
      stageClassSync();
      return true;
    case "class-apply":
      applyClassSync();
      return true;
    case "class-remove":
      snapshot();
      note().classNotes = classAttachments().filter(
        (a) => a.id !== el.dataset.id,
      );
      save();
      render();
      classNotesModal();
      toast("첨부를 삭제했어요. 이미 정리한 내용은 보관됩니다.");
      return true;
    case "class-dna":
      closeModal();
      navigate("dna");
      return true;
    case "class-priority":
      ui.draft.classPriority = Number(el.dataset.value);
      for (const x of $$('[data-action="class-priority"]')) {
        x.classList.toggle("selected", x === el);
        x.setAttribute("aria-pressed", String(x === el));
      }
      refreshClassDNA();
      return true;
    case "habit-apply":
      decideRecommendation("applied");
      return true;
    case "habit-ignore":
      decideRecommendation("ignored");
      return true;
    default:
      return false;
  }
}
