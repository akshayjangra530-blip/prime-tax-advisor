/* Prime Tax Advisor — Bilingual Single-Page Flow Controller (ganeshsingal.com Aesthetic + Artifact Data) */

const STORAGE_CASES_KEY = "pta_cases_v2";
const STORAGE_LANG_KEY = "pta_lang_v1";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadSavedLang() {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved === "en" || saved === "hi") return saved;
  } catch {
    // Ignore storage errors
  }
  return "hi";
}

function loadCases() {
  try {
    const raw = localStorage.getItem(STORAGE_CASES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback to initial cases
  }
  return structuredClone(INITIAL_CASES);
}

function saveCases(cases) {
  try {
    localStorage.setItem(STORAGE_CASES_KEY, JSON.stringify(cases));
  } catch {
    // Ignore storage errors
  }
}

const state = {
  lang: loadSavedLang(),
  mobileOpen: false,
  intake: {
    serviceId: "gst",
    queryIndex: 0,
    customQuery: "",
    entityId: "pvt-ltd",
    name: "",
    email: "",
    mobile: "",
    pan: "",
    gstin: "",
    problem: "",
    departmentName: "",
    noticeDueDate: "",
    noticeFiles: [],
    files: []
  },
  docFilter: {
    serviceId: "gst",
    entityId: "pvt-ltd",
    noticeMode: false,
    targetCaseId: INITIAL_CASES[0].id
  },
  cases: loadCases(),
  selectedCaseId: null,
  portalSearch: "",
  waQuickName: "",
  waQuickHelp: ""
};

state.selectedCaseId = state.cases[0]?.id || null;

function txt(key) {
  return UI_TEXT[state.lang][key] ?? UI_TEXT.hi[key] ?? key;
}

function loc(obj) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  return obj[state.lang] || obj.hi || obj.en || "";
}

function getService(serviceId) {
  return SERVICES.find((s) => s.id === serviceId) || SERVICES[0];
}

function getEntity(entityId) {
  return ENTITIES.find((e) => e.id === entityId) || ENTITIES[0];
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function openModal(title, htmlContent) {
  const backdrop = document.getElementById("modal-backdrop");
  const titleEl = document.getElementById("modal-title");
  const bodyEl = document.getElementById("modal-body");
  if (!backdrop || !titleEl || !bodyEl) return;
  titleEl.textContent = title;
  bodyEl.innerHTML = htmlContent;
  backdrop.hidden = false;
}

function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  if (backdrop) backdrop.hidden = true;
}

/* ---------- Header / Navbar ---------- */

function renderNavbar() {
  const host = document.getElementById("site-nav-wrap");
  if (!host) return;

  const navItems = [
    { href: "#about", label: txt("navAbout") },
    { href: "#services", label: txt("navServices") },
    { href: "#intake-desk", label: txt("navIntake") },
    { href: "#documents", label: txt("navDocs") },
    { href: "#process", label: txt("navProcess") },
    { href: "#tools", label: txt("navTools") },
    { href: "#faq", label: txt("navFaq") },
    { href: "#contact", label: txt("navContact") }
  ];

  host.innerHTML = `
    <nav class="wrap nav-bar" aria-label="Main navigation">
      <a href="#top" class="logo">
        <img src="logo-icon.png" alt="Prime Tax Advisor Logo" class="brand-logo-img" />
        <span>${escapeHtml(txt("brandLeft"))}</span>
        <span class="logo-accent">${escapeHtml(txt("brandRight"))}</span>
      </a>

      <ul class="nav-links">
        ${navItems.map((item) => `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`).join("")}
      </ul>

      <div class="nav-actions">
        <div class="lang-toggle" role="group" aria-label="Language switch">
          <button type="button" class="lang-btn ${state.lang === "hi" ? "active" : ""}" data-set-lang="hi">हिंदी</button>
          <button type="button" class="lang-btn ${state.lang === "en" ? "active" : ""}" data-set-lang="en">EN</button>
        </div>
        <a href="#intake-desk" class="btn sm nav-cta">${escapeHtml(txt("navCta"))}</a>
        <button type="button" class="burger-btn" id="burger-btn" aria-label="Menu" aria-expanded="${state.mobileOpen}">☰</button>
      </div>
    </nav>
    <div class="mobile-menu" id="mobile-menu" ${state.mobileOpen ? "" : "hidden"}>
      ${navItems.map((item) => `<a href="${item.href}" data-close-mobile>${escapeHtml(item.label)}</a>`).join("")}
    </div>
  `;
}

/* ---------- Section Builders ---------- */

function wrapWordsHtml(text, startDelay = 0, extraClass = "") {
  const words = String(text || "").trim().split(/\s+/);
  return words
    .map((word, idx) => {
      const delay = startDelay + idx * 65;
      const cls = extraClass ? `w ${extraClass}` : "w";
      return `<span class="${cls}" style="--d:${delay}ms">${escapeHtml(word)}</span>`;
    })
    .join(" ");
}

function renderHeroSection() {
  const preText = txt("heroTitlePre");
  const gradText = txt("heroTitleGrad");
  const preWordsCount = preText.trim().split(/\s+/).length;

  return `
    <header class="hero" id="top">
      <div class="orb orb1" aria-hidden="true"></div>
      <div class="orb orb2" aria-hidden="true"></div>
      <div class="wrap hero-inner">
        <div class="hero-crest-wrap">
          <div class="hero-crest">
            <img src="logo.jpg" alt="Prime Tax Advisor Accountants" />
          </div>
        </div>
        <div class="hero-pill">${escapeHtml(txt("heroPill"))}</div>
        <h1>
          ${wrapWordsHtml(preText, 0)}<br />
          ${wrapWordsHtml(gradText, preWordsCount * 65, "hero-grad")}
        </h1>
        <p class="hero-sub">${escapeHtml(txt("heroSub"))}</p>
        <div class="hero-cta-row">
          <a href="#intake-desk" class="btn">${escapeHtml(txt("heroBtnPrimary"))}</a>
          <a href="#services" class="btn ghost">${escapeHtml(txt("heroBtnGhost"))}</a>
        </div>
        <div class="hero-stats rv">
          <div class="hero-stat-card">
            <span class="hero-stat-val">${escapeHtml(txt("heroStat1Val"))}</span>
            <span class="hero-stat-lbl">${escapeHtml(txt("heroStat1Lbl"))}</span>
          </div>
          <div class="hero-stat-card">
            <span class="hero-stat-val">${escapeHtml(txt("heroStat2Val"))}</span>
            <span class="hero-stat-lbl">${escapeHtml(txt("heroStat2Lbl"))}</span>
          </div>
          <div class="hero-stat-card">
            <span class="hero-stat-val">${escapeHtml(txt("heroStat3Val"))}</span>
            <span class="hero-stat-lbl">${escapeHtml(txt("heroStat3Lbl"))}</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

function renderVmvSection() {
  const values = UI_TEXT[state.lang].vmvValues || UI_TEXT.hi.vmvValues;
  return `
    <section class="sec" id="vmv">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("vmvEyebrow"))}</span>
          <h2>${escapeHtml(txt("vmvTitle"))}</h2>
          <p>${escapeHtml(txt("vmvSub"))}</p>
        </div>

        <div class="grid-3">
          <article class="card rv">
            <div class="ico-badge">🎯</div>
            <h3>${escapeHtml(txt("vmv1Title"))}</h3>
            <p>${escapeHtml(txt("vmv1Desc"))}</p>
          </article>

          <article class="card rv">
            <div class="ico-badge">🚀</div>
            <h3>${escapeHtml(txt("vmv2Title"))}</h3>
            <p>${escapeHtml(txt("vmv2Desc"))}</p>
          </article>

          <article class="card rv">
            <div class="ico-badge">🤝</div>
            <h3>${escapeHtml(txt("vmv3Title"))}</h3>
            <div class="chips" style="margin-top:0.6rem;">
              ${values.map((v) => `<span class="chip">${escapeHtml(v)}</span>`).join("")}
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderMarqueeSection() {
  const items = SERVICES.map((s) => loc(s.name));
  const strip = items.map((label) => `<span>${escapeHtml(label)} <span class="marq-star">✦</span></span>`).join("");
  return `
    <div class="marq" aria-hidden="true">
      <div class="marq-track">${strip}${strip}${strip}</div>
    </div>
  `;
}

function renderAboutSection() {
  return `
    <section class="sec" id="about">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("aboutEyebrow"))}</span>
          <h2>${escapeHtml(txt("aboutTitle"))}</h2>
          <p>${escapeHtml(txt("aboutSub"))}</p>
        </div>

        <div class="grid-3">
          <article class="card rv">
            <h3>${escapeHtml(txt("aboutCard1Title"))}</h3>
            <p>${escapeHtml(txt("aboutCard1Desc"))}</p>
          </article>

          <article class="card rv">
            <h3>${escapeHtml(txt("aboutCard2Title"))}</h3>
            <p>${escapeHtml(txt("aboutCard2Desc"))}</p>
            <div class="chips">
              ${ENTITIES.map((ent) => `
                <button type="button"
                        class="chip ${state.intake.entityId === ent.id ? "active" : ""}"
                        data-pick-entity-jump="${ent.id}">
                  ${escapeHtml(loc(ent.name))}
                </button>
              `).join("")}
            </div>
          </article>

          <article class="card rv">
            <h3>${escapeHtml(txt("aboutCard3Title"))}</h3>
            <p>${escapeHtml(txt("aboutCard3Desc"))}</p>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderBentoServicesSection() {
  return `
    <section class="sec alt" id="services">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("servicesEyebrow"))}</span>
          <h2>${escapeHtml(txt("servicesTitle"))}</h2>
          <p>${escapeHtml(txt("servicesSub"))}</p>
        </div>

        <div class="grid-bento">
          ${SERVICES.map((svc) => {
            const spanClass = svc.bentoSpan === 2 ? "span-2" : svc.bentoSpan === 3 ? "span-3" : "";
            return `
              <article class="card bento-card ${spanClass} rv" data-jump-service="${svc.id}" tabindex="0" role="button">
                <div>
                  <div class="ico-badge">${svc.icon}</div>
                  <h3>${escapeHtml(loc(svc.name))}</h3>
                  <p>${escapeHtml(loc(svc.shortDesc))}</p>
                  <div class="mini-pills">
                    ${svc.queries.filter((q) => !q.isOther).slice(0, 5).map((q) => `<span class="mini">${escapeHtml(loc(q))}</span>`).join("")}
                  </div>
                </div>
                <div class="bento-cta">${escapeHtml(txt("serviceCardAction"))}</div>
              </article>
            `;
          }).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderIntakeDeskSection() {
  const svc = getService(state.intake.serviceId);
  const ent = getEntity(state.intake.entityId);
  const selectedQuery = svc.queries[state.intake.queryIndex] || svc.queries[0];
  const showCustom = Boolean(selectedQuery?.isOther);
  const noticeRequired = isNoticeCase(svc.id, state.intake.queryIndex);
  const reqDocs = getRequiredDocuments(svc.id, ent.id, state.intake.queryIndex, false, state.lang);

  return `
    <section class="sec" id="intake-desk">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("deskEyebrow"))}</span>
          <h2>${escapeHtml(txt("deskTitle"))}</h2>
          <p>${escapeHtml(txt("deskSub"))}</p>
        </div>

        <div class="desk-shell rv">
          <span class="desk-step-tag">${escapeHtml(txt("deskStep1"))}</span>
          <div class="service-tabs" role="tablist" aria-label="Services">
            ${SERVICES.map((item) => `
              <button type="button"
                      class="service-tab ${item.id === svc.id ? "active" : ""}"
                      data-select-service="${item.id}"
                      role="tab"
                      aria-selected="${item.id === svc.id}">
                <span class="service-tab-icon">${item.icon}</span>
                <span class="service-tab-name">${escapeHtml(loc(item.name))}</span>
              </button>
            `).join("")}
          </div>

          <div class="desk-split">
            <div class="query-box">
              <span class="desk-step-tag">${escapeHtml(txt("deskStep2"))}</span>
              <div class="query-head">
                <h3>${escapeHtml(loc(svc.name))}: ${escapeHtml(txt("deskQuerySuffix"))}</h3>
                <span class="badge badge-blue">${escapeHtml(loc(svc.turnaround))}</span>
              </div>

              <div class="query-list" role="radiogroup">
                ${svc.queries.map((qObj, idx) => `
                  <button type="button"
                          class="query-btn ${idx === state.intake.queryIndex ? "active" : ""}"
                          data-select-query-idx="${idx}"
                          role="radio"
                          aria-checked="${idx === state.intake.queryIndex}">
                    <span>${escapeHtml(loc(qObj))}</span>
                    <span class="radio-dot" aria-hidden="true"></span>
                  </button>
                `).join("")}
              </div>

              ${showCustom ? `
                <div class="fg" style="margin-top:0.85rem;">
                  <label class="fl" for="custom-query-input">${escapeHtml(txt("customQueryLabel"))} <span class="req">*</span></label>
                  <input id="custom-query-input"
                         class="fc"
                         data-intake-field="customQuery"
                         value="${escapeHtml(state.intake.customQuery)}"
                         placeholder="${escapeHtml(txt("customQueryPlaceholder"))}" />
                </div>
              ` : ""}

              ${noticeRequired ? `
                <div class="notice-box">
                  <h4 class="notice-box-title">⚠ ${escapeHtml(txt("noticeAlertTitle"))}</h4>
                  <div class="form-grid">
                    <div class="fg">
                      <label class="fl" for="dept-input">${escapeHtml(txt("deptLabel"))} <span class="req">*</span></label>
                      <input id="dept-input"
                             class="fc"
                             data-intake-field="departmentName"
                             value="${escapeHtml(state.intake.departmentName)}"
                             placeholder="${escapeHtml(txt("deptPlaceholder"))}" />
                    </div>
                    <div class="fg">
                      <label class="fl" for="due-input">${escapeHtml(txt("dueDateLabel"))} <span class="req">*</span></label>
                      <input id="due-input"
                             type="date"
                             class="fc"
                             data-intake-field="noticeDueDate"
                             value="${escapeHtml(state.intake.noticeDueDate)}" />
                    </div>
                    <div class="fg full">
                      <label class="fl" for="notice-file-input">${escapeHtml(txt("noticeUploadLabel"))}</label>
                      <input id="notice-file-input"
                             type="file"
                             class="fc"
                             data-upload-target="noticeFiles"
                             accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                             multiple />
                      ${state.intake.noticeFiles.length ? `
                        <div class="file-list">
                          ${state.intake.noticeFiles.map((f, idx) => `
                            <div class="file-row">
                              <span>📄 ${escapeHtml(f.name)} (${escapeHtml(f.size)})</span>
                              <button type="button" class="file-del" data-remove-file="noticeFiles:${idx}">${escapeHtml(txt("removeBtn"))}</button>
                            </div>
                          `).join("")}
                        </div>
                      ` : `<span class="hint">${escapeHtml(txt("noticeUploadHint"))}</span>`}
                    </div>
                  </div>
                </div>
              ` : ""}
            </div>

            <form class="intake-form" id="case-intake-form" novalidate>
              <span class="desk-step-tag">${escapeHtml(txt("deskStep3"))}</span>
              <h3 style="margin:0 0 0.85rem; font-family:var(--font-ui); font-size:1.02rem;">${escapeHtml(txt("deskFormTitle"))}</h3>

              <div class="fg" style="margin-bottom:0.9rem;">
                <label class="fl">${escapeHtml(txt("deskEntityLabel"))} <span class="req">*</span></label>
                <div class="entity-row">
                  ${ENTITIES.map((item) => `
                    <button type="button"
                            class="entity-chip ${item.id === ent.id ? "active" : ""}"
                            data-select-entity="${item.id}">
                      ${escapeHtml(loc(item.name))}
                    </button>
                  `).join("")}
                </div>
              </div>

              <div class="form-grid">
                <div class="fg">
                  <label class="fl" for="f-name">${escapeHtml(txt("nameLabel"))} <span class="req">*</span></label>
                  <input id="f-name" class="fc" data-intake-field="name" value="${escapeHtml(state.intake.name)}" placeholder="${escapeHtml(txt("namePlaceholder"))}" />
                </div>
                <div class="fg">
                  <label class="fl" for="f-mobile">${escapeHtml(txt("mobileLabel"))} <span class="req">*</span></label>
                  <input id="f-mobile" class="fc" data-intake-field="mobile" value="${escapeHtml(state.intake.mobile)}" placeholder="${escapeHtml(txt("mobilePlaceholder"))}" />
                </div>
                <div class="fg">
                  <label class="fl" for="f-email">${escapeHtml(txt("emailLabel"))} <span class="req">*</span></label>
                  <input id="f-email" type="email" class="fc" data-intake-field="email" value="${escapeHtml(state.intake.email)}" placeholder="${escapeHtml(txt("emailPlaceholder"))}" />
                </div>
                <div class="fg">
                  <label class="fl" for="f-pan">${escapeHtml(txt("panLabel"))}</label>
                  <input id="f-pan" class="fc" data-intake-field="pan" value="${escapeHtml(state.intake.pan)}" placeholder="ABCDE1234F" maxlength="10" style="text-transform:uppercase;" />
                </div>
                <div class="fg full">
                  <label class="fl" for="f-gstin">${escapeHtml(txt("gstinLabel"))}</label>
                  <input id="f-gstin" class="fc" data-intake-field="gstin" value="${escapeHtml(state.intake.gstin)}" placeholder="07ABCDE1234F1Z5" maxlength="15" style="text-transform:uppercase;" />
                </div>
                <div class="fg full">
                  <label class="fl" for="f-problem">${escapeHtml(txt("problemLabel"))} <span class="req">*</span></label>
                  <textarea id="f-problem" rows="3" class="fc" data-intake-field="problem" placeholder="${escapeHtml(txt("problemPlaceholder"))}">${escapeHtml(state.intake.problem)}</textarea>
                </div>
                <div class="fg full">
                  <label class="fl" for="f-upload">${escapeHtml(txt("uploadLabel"))}</label>
                  <label class="dropzone" for="f-upload" data-dropzone="files">
                    <div style="font-weight:700; color:var(--a); font-size:0.88rem;">${escapeHtml(txt("uploadDropTitle"))}</div>
                    <div class="hint">${escapeHtml(txt("uploadDropHint"))}</div>
                    <input type="file" id="f-upload" data-upload-target="files" multiple accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.doc,.docx" hidden />
                  </label>
                  ${state.intake.files.length ? `
                    <div class="file-list">
                      ${state.intake.files.map((f, idx) => `
                        <div class="file-row">
                          <span>📎 ${escapeHtml(f.name)} (${escapeHtml(f.size)})</span>
                          <button type="button" class="file-del" data-remove-file="files:${idx}">${escapeHtml(txt("removeBtn"))}</button>
                        </div>
                      `).join("")}
                    </div>
                  ` : ""}
                </div>
              </div>

              <div class="docs-panel">
                <div class="docs-panel-head">
                  <h4>${escapeHtml(txt("reqDocsHeading"))} (${escapeHtml(loc(svc.name))} · ${escapeHtml(loc(ent.name))})</h4>
                  <span class="hint">${reqDocs.length} ${escapeHtml(txt("docsCountUnit"))}</span>
                </div>
                <div class="doc-tags">
                  ${reqDocs.map((d) => `<span class="doc-tag">✓ ${escapeHtml(d)}</span>`).join("")}
                </div>
              </div>

              <button type="submit" class="btn" style="width:100%; margin-top:1.05rem;">${escapeHtml(txt("submitBtn"))}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderDocumentsSection() {
  const f = state.docFilter;
  const svc = getService(f.serviceId);
  const ent = getEntity(f.entityId);
  const docs = getRequiredDocuments(svc.id, ent.id, 0, f.noticeMode, state.lang);

  return `
    <section class="sec alt" id="documents">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("docsEyebrow"))}</span>
          <h2>${escapeHtml(txt("docsTitle"))}</h2>
          <p>${escapeHtml(txt("docsSub"))}</p>
        </div>

        <div class="desk-split rv">
          <div class="card">
            <div class="fg" style="margin-bottom:0.85rem;">
              <label class="fl" for="doc-svc-sel">${escapeHtml(txt("docsSelectService"))}</label>
              <select id="doc-svc-sel" class="fc" data-doc-filter="serviceId">
                ${SERVICES.map((s) => `<option value="${s.id}" ${s.id === f.serviceId ? "selected" : ""}>${escapeHtml(loc(s.name))}</option>`).join("")}
              </select>
            </div>
            <div class="fg" style="margin-bottom:0.85rem;">
              <label class="fl" for="doc-ent-sel">${escapeHtml(txt("docsSelectEntity"))}</label>
              <select id="doc-ent-sel" class="fc" data-doc-filter="entityId">
                ${ENTITIES.map((e) => `<option value="${e.id}" ${e.id === f.entityId ? "selected" : ""}>${escapeHtml(loc(e.name))}</option>`).join("")}
              </select>
            </div>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; font-weight:600; margin-bottom:0.9rem; cursor:pointer;">
              <input type="checkbox" data-doc-filter-check="noticeMode" ${f.noticeMode ? "checked" : ""} />
              ${escapeHtml(txt("docsNoticeToggle"))}
            </label>
            <div class="docs-panel" style="margin-top:0;">
              <div class="docs-panel-head">
                <h4>${escapeHtml(loc(svc.name))} · ${escapeHtml(loc(ent.name))}</h4>
                <span class="badge badge-blue">${docs.length} ${escapeHtml(txt("docsRequiredBadge"))}</span>
              </div>
              <div class="doc-tags">
                ${docs.map((d) => `<span class="doc-tag">✓ ${escapeHtml(d)}</span>`).join("")}
              </div>
            </div>
          </div>

          <div class="card">
            <h3>${escapeHtml(txt("docsExistingTitle"))}</h3>
            <p style="margin-bottom:1.15rem;">${escapeHtml(txt("docsExistingSub"))}</p>
            <div class="docs-panel" style="margin-top:0; margin-bottom:1.15rem;">
              <div class="docs-panel-head">
                <h4>${escapeHtml(loc(svc.name))} · ${escapeHtml(loc(ent.name))}</h4>
                <span class="badge badge-blue">${docs.length} ${escapeHtml(txt("docsRequiredBadge"))}</span>
              </div>
              <div class="hint">${escapeHtml(txt("contactPhoneLabel"))}: Aman Moyal · +91 83079-18448</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.65rem;">
              <button type="button" class="btn" data-jump-service="${svc.id}">${escapeHtml(txt("docsUseInDesk"))}</button>
              <a href="https://wa.me/918307918448" target="_blank" rel="noopener" class="btn wa sm">${escapeHtml(txt("docsSendWaBtn"))}</a>
              <a href="mailto:prime.tax.advisor01@gmail.com" class="btn ghost sm">${escapeHtml(txt("docsSendMailBtn"))}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderProcessSection() {
  return `
    <section class="sec" id="process">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("processEyebrow"))}</span>
          <h2>${escapeHtml(txt("processTitle"))}</h2>
          <p>${escapeHtml(txt("processSub"))}</p>
        </div>

        <div class="tl2-wrap rv">
          <div class="tl2-line" aria-hidden="true"><div class="tl2-line-fill"></div></div>
          <div class="tl2">
            ${PROCESS_CARDS.map((card) => `
              <div class="st">
                <div class="st-num">${card.num}</div>
                <h3>${escapeHtml(loc(card.title))}</h3>
                <p>${escapeHtml(loc(card.desc))}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBandSection() {
  return `
    <section class="band">
      <div class="wrap rv">
        <h2>${escapeHtml(txt("bandTitle"))}</h2>
        <p>${escapeHtml(txt("bandSub"))}</p>
        <a href="tel:+918307918448" class="btn">${escapeHtml(txt("bandBtn"))}</a>
      </div>
    </section>
  `;
}

function renderToolsSection() {
  return `
    <section class="sec alt" id="tools">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("toolsEyebrow"))}</span>
          <h2>${escapeHtml(txt("toolsTitle"))}</h2>
          <p>${escapeHtml(txt("toolsSub"))}</p>
        </div>

        <div class="card cal-card rv">
          ${COMPLIANCE_DATES.map((item) => `
            <div class="cal-row">
              <span class="cal-date">${escapeHtml(loc(item.date))}</span>
              <span>${escapeHtml(loc(item.desc))}</span>
            </div>
          `).join("")}
          <p class="hint" style="margin-top:0.85rem;">${escapeHtml(txt("toolsNote"))}</p>
        </div>
      </div>
    </section>
  `;
}

function renderFaqSection() {
  return `
    <section class="sec" id="faq">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("faqEyebrow"))}</span>
          <h2>${escapeHtml(txt("faqTitle"))}</h2>
        </div>
        <div class="faq-wrap rv">
          ${FAQ_ITEMS.map((item, idx) => `
            <details class="faq-box" ${idx === 0 ? "open" : ""}>
              <summary>${escapeHtml(loc(item.q))}</summary>
              <p>${escapeHtml(loc(item.a))}</p>
            </details>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderContactSection() {
  return `
    <section class="sec alt" id="contact">
      <div class="wrap">
        <div class="sec-head rv">
          <span class="eyebrow">${escapeHtml(txt("contactEyebrow"))}</span>
          <h2>${escapeHtml(txt("contactTitle"))}</h2>
          <p>${escapeHtml(txt("contactSub"))}</p>
        </div>

        <div class="contact-card rv">
          <div>
            <div class="c-row">
              <div class="c-ico">📍</div>
              <div>
                <strong>${escapeHtml(txt("contactAddrLabel"))}</strong>
                <div class="hint" style="font-size:0.88rem;">${escapeHtml(txt("contactAddrVal"))}</div>
              </div>
            </div>
            <div class="c-row">
              <div class="c-ico">📞</div>
              <div>
                <strong>${escapeHtml(txt("contactPhoneLabel"))}</strong>
                <div style="font-size:0.9rem; margin-top:0.1rem;">
                  <span style="font-weight:600;">Aman Moyal:</span>
                  <a href="tel:+918307918448" style="color:var(--a); font-weight:700;">+91 83079-18448</a>
                  <span class="hint" style="font-weight:600;"> (Available for online payment)</span>
                </div>
              </div>
            </div>
            <div class="c-row">
              <div class="c-ico">👥</div>
              <div>
                <strong>${escapeHtml(txt("contactAnotherLabel"))}</strong>
                <div style="display:grid; gap:0.2rem; margin-top:0.15rem; font-size:0.88rem;">
                  <div><span style="font-weight:600;">Rahul Goswami:</span> <a href="tel:+919817419964" style="color:var(--a); font-weight:700;">+91 98174 19964</a></div>
                  <div><span style="font-weight:600;">Yogesh Moyal:</span> <a href="tel:+917015249529" style="color:var(--a); font-weight:700;">+91 70152 49529</a></div>
                </div>
              </div>
            </div>
            <div class="c-row">
              <div class="c-ico">✉️</div>
              <div>
                <strong>${escapeHtml(txt("contactEmailLabel"))}</strong>
                <div><a href="mailto:prime.tax.advisor01@gmail.com" style="color:var(--a); font-weight:700;">prime.tax.advisor01@gmail.com</a></div>
              </div>
            </div>
            <div class="c-row">
              <div class="c-ico">🕒</div>
              <div>
                <strong>${escapeHtml(txt("contactHoursLabel"))}</strong>
                <div class="hint" style="font-size:0.88rem;">${escapeHtml(txt("contactHoursVal"))}</div>
              </div>
            </div>

            <form id="wa-quick-form" style="margin-top:1.2rem; padding-top:1.1rem; border-top:1px solid var(--line);">
              <h3 style="margin:0 0 0.65rem; font-family:var(--font-ui); font-size:0.96rem;">${escapeHtml(txt("contactWaHeading"))}</h3>
              <div class="fg" style="margin-bottom:0.6rem;">
                <input id="wa-q-name" class="fc" value="${escapeHtml(state.waQuickName)}" placeholder="${escapeHtml(txt("contactWaNamePlaceholder"))}" required />
              </div>
              <div class="fg" style="margin-bottom:0.75rem;">
                <input id="wa-q-help" class="fc" value="${escapeHtml(state.waQuickHelp)}" placeholder="${escapeHtml(txt("contactWaMsgPlaceholder"))}" required />
              </div>
              <button type="submit" class="btn wa sm">${escapeHtml(txt("contactWaBtn"))}</button>
            </form>
          </div>

          <div>
            <div class="map-box">
              <svg viewBox="0 0 420 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <rect width="420" height="260" fill="#eef2f6"/>
                <rect x="20" y="18" width="90" height="44" rx="10" fill="#dcfce7"/>
                <rect x="300" y="155" width="96" height="58" rx="12" fill="#e0f2fe"/>
                <path d="M0 70 L420 95 M0 165 L420 140 M120 0 L150 260 M285 0 L255 260" stroke="#ffffff" stroke-width="14"/>
                <path d="M0 70 L420 95 M120 0 L150 260" stroke="#dbeafe" stroke-width="4"/>
                <circle class="map-pin-pulse" cx="215" cy="115" r="30" fill="rgba(15,76,129,0.2)"/>
                <circle cx="215" cy="115" r="16" fill="rgba(201,151,58,0.25)"/>
                <path d="M215 86 C203 86 194 95 194 107 C194 122 215 142 215 142 C215 142 236 122 236 107 C236 95 227 86 215 86 Z" fill="#0f4c81"/>
                <circle cx="215" cy="107" r="6" fill="#c9973a"/>
              </svg>
              <div class="map-float">
                <div>
                  <strong style="font-size:0.86rem; display:block;">${escapeHtml(txt("mapTitle"))}</strong>
                  <span class="hint">${escapeHtml(txt("mapSub"))}</span>
                </div>
                <a href="https://maps.google.com/?q=Sirsa+Haryana+125055" target="_blank" rel="noopener" class="btn ghost sm">${escapeHtml(txt("mapBtn"))}</a>
              </div>
            </div>
          </div>
        </div>

        <p class="disc">${escapeHtml(txt("disclaimer"))}</p>
      </div>
    </section>

    <footer class="site-footer">
      <div class="wrap footer-inner">
        <span class="footer-brand-badge">
          <img src="logo-icon.png" alt="Prime Tax Advisor" class="footer-logo-img" />
          <span>${escapeHtml(txt("footerCopy"))}</span>
        </span>
        <span>${escapeHtml(txt("contactAddrVal"))} · Aman Moyal: <a href="tel:+918307918448">+91 83079-18448 (Available for online payment)</a> · <a href="mailto:prime.tax.advisor01@gmail.com">prime.tax.advisor01@gmail.com</a></span>
      </div>
    </footer>
  `;
}

/* ---------- Validation & Case Submission ---------- */

function validateAndSubmitIntake() {
  const i = state.intake;
  const svc = getService(i.serviceId);
  const ent = getEntity(i.entityId);
  const qObj = svc.queries[i.queryIndex] || svc.queries[0];
  const isHi = state.lang === "hi";

  if (!i.name.trim()) {
    return showToast(isHi ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name.", "error");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email.trim())) {
    return showToast(isHi ? "कृपया मान्य ईमेल पता दर्ज करें।" : "Please enter a valid email address.", "error");
  }
  const cleanMobile = i.mobile.replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
    return showToast(isHi ? "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.", "error");
  }
  const cleanPan = i.pan.trim().toUpperCase();
  if (cleanPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
    return showToast(isHi ? "PAN फॉर्मेट मान्य नहीं है (उदा. ABCDE1234F)।" : "Invalid PAN format (e.g. ABCDE1234F).", "error");
  }
  const cleanGstin = i.gstin.trim().toUpperCase();
  if (cleanGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
    return showToast(isHi ? "GSTIN फॉर्मेट मान्य नहीं है।" : "Invalid 15-character GSTIN format.", "error");
  }
  if (qObj.isOther && !i.customQuery.trim()) {
    return showToast(isHi ? "कृपया 'अदर' में अपनी समस्या लिखें।" : "Please describe your custom query.", "error");
  }
  if (isNoticeCase(svc.id, i.queryIndex)) {
    if (!i.departmentName.trim()) {
      return showToast(isHi ? "नोटिस केस के लिए विभाग का नाम लिखें।" : "Please enter the Department Name for notice cases.", "error");
    }
    if (!i.noticeDueDate) {
      return showToast(isHi ? "नोटिस केस के लिए जवाब की आखिरी तारीख चुनें।" : "Please select the Reply Due Date.", "error");
    }
  }
  if (!i.problem.trim()) {
    return showToast(isHi ? "कृपया अपनी समस्या का संक्षिप्त विवरण लिखें।" : "Please enter a brief problem description.", "error");
  }

  const caseId = `PTA-2026-${Math.floor(1200 + Math.random() * 8700)}`;
  const resolvedQuery = qObj.isOther
    ? { hi: `अदर: ${i.customQuery.trim()}`, en: `Other: ${i.customQuery.trim()}` }
    : qObj;
  const combinedFiles = [...i.noticeFiles, ...i.files];
  const docsComplete = combinedFiles.length >= 2;

  const missingList = docsComplete
    ? []
    : (DOCUMENT_MATRIX[svc.id]?.all || []).slice(0, 3);

  const newCase = {
    id: caseId,
    createdAt: "27 Nov 2026",
    name: i.name.trim(),
    mobile: cleanMobile,
    email: i.email.trim(),
    pan: cleanPan || "Pending",
    gstin: cleanGstin,
    serviceId: svc.id,
    serviceName: svc.name,
    query: resolvedQuery,
    entityId: ent.id,
    entityName: ent.name,
    problem: i.problem.trim(),
    departmentName: i.departmentName.trim(),
    noticeDueDate: i.noticeDueDate,
    stageIndex: 1,
    docsComplete,
    missingDocs: missingList,
    uploadedFiles: combinedFiles,
    feeQuote: null,
    consultantNote: docsComplete
      ? {
          hi: "आपका केस और प्रारंभिक डॉक्यूमेंट प्राप्त हो गए हैं। सीनियर कंसल्टेंट 24 घंटे में रिव्यू कर कॉल व फीस कोट साझा करेंगे।",
          en: "Case and initial documents received. A senior consultant will review and share a call/fee quote within 24 hours."
        }
      : {
          hi: "आपका केस दर्ज हो गया है। कृपया संपूर्ण रिव्यू के लिए शेष आवश्यक डॉक्यूमेंट क्लाइंट पोर्टल से अपलोड करें।",
          en: "Case registered. Please upload the remaining required documents from the Client Portal for full review."
        }
  };

  state.cases.unshift(newCase);
  state.selectedCaseId = caseId;
  saveCases(state.cases);

  const waText = encodeURIComponent(
    `Prime Tax Advisor Case Confirmation\nCase ID: ${caseId}\nService: ${loc(svc.name)} (${loc(resolvedQuery)})\nEntity: ${loc(ent.name)}\nName: ${newCase.name}\nMobile: ${newCase.mobile}\nEmail: ${newCase.email}`
  );
  const mailSubject = encodeURIComponent(`New Case ${caseId} - ${loc(svc.name)}`);

  openModal(
    txt("modalConfirmTitle"),
    `
      <div class="docs-panel" style="margin-top:0; background:var(--surface-emerald); border-color:#86efac;">
        <div style="font-weight:800; color:var(--emerald); margin-bottom:0.25rem;">✓ ${escapeHtml(txt("modalCaseLabel"))} ${escapeHtml(caseId)}</div>
        <div style="font-size:0.86rem;">${escapeHtml(txt("modalSentPrefix"))} <strong>${escapeHtml(newCase.email)}</strong> &amp; <strong>+91 ${escapeHtml(newCase.mobile)}</strong></div>
      </div>
      <div style="margin-top:0.95rem; display:grid; gap:0.45rem; font-size:0.88rem;">
        <div><strong>${escapeHtml(txt("modalSvcLabel"))}</strong> ${escapeHtml(loc(svc.name))} — ${escapeHtml(loc(resolvedQuery))}</div>
        <div><strong>${escapeHtml(txt("modalEntityLabel"))}</strong> ${escapeHtml(loc(ent.name))}</div>
        <div><strong>${escapeHtml(txt("modalFilesLabel"))}</strong> ${newCase.uploadedFiles.length}</div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:0.65rem; margin-top:1.2rem;">
        <a href="https://wa.me/918307918448?text=${waText}" target="_blank" rel="noopener" class="btn wa sm">${escapeHtml(txt("modalWaBtn"))}</a>
        <a href="mailto:prime.tax.advisor01@gmail.com?subject=${mailSubject}&body=${waText}" class="btn ghost sm">${escapeHtml(txt("modalMailBtn"))}</a>
      </div>
    `
  );

  state.intake.problem = "";
  state.intake.customQuery = "";
  state.intake.files = [];
  state.intake.noticeFiles = [];
  renderAll();
}

/* ---------- Render & Observers ---------- */

let revealObserver = null;
let processObserver = null;
let hasInitializedOnce = false;

function activateProcessTimeline(wrapEl) {
  if (!wrapEl || wrapEl.dataset.tlDone === "1") return;
  wrapEl.dataset.tlDone = "1";
  wrapEl.classList.add("in");
  const steps = wrapEl.querySelectorAll(".st");
  steps.forEach((stepEl, idx) => {
    setTimeout(() => {
      stepEl.classList.add("on");
    }, idx * 280);
  });
}

function applyStaggerDelays() {
  document.querySelectorAll(".grid-3, .grid-bento, .tl2, .faq-wrap").forEach((group) => {
    const items = group.querySelectorAll(".rv, .st");
    items.forEach((el, idx) => {
      el.style.setProperty("--rv-d", `${(idx % 4) * 90}ms`);
    });
  });
}

function revealVisibleNodes() {
  const vh = window.innerHeight || 900;
  document.querySelectorAll(".rv:not(.in)").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= vh * 0.92 && rect.bottom >= 0) {
      el.classList.add("in");
      if (revealObserver) revealObserver.unobserve(el);
    } else if (rect.bottom < 0) {
      el.classList.add("in");
      if (revealObserver) revealObserver.unobserve(el);
    }
  });

  const tlWrap = document.querySelector(".tl2-wrap:not([data-tl-done='1'])");
  if (tlWrap) {
    const r = tlWrap.getBoundingClientRect();
    if (r.top <= vh * 0.92) {
      activateProcessTimeline(tlWrap);
      if (processObserver) processObserver.unobserve(tlWrap);
    }
  }
}

function initScrollEffects(skipStaggerForExisting = false) {
  if (revealObserver) revealObserver.disconnect();
  if (processObserver) processObserver.disconnect();

  applyStaggerDelays();
  const nodes = document.querySelectorAll(".rv");

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("in"));
    activateProcessTimeline(document.querySelector(".tl2-wrap"));
    return;
  }

  if (skipStaggerForExisting) {
    const vh = window.innerHeight || 900;
    nodes.forEach((el) => {
      if (el.getBoundingClientRect().top <= vh * 1.1) {
        el.style.setProperty("--rv-d", "0ms");
        el.classList.add("in");
      }
    });
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          if (entry.target.classList.contains("tl2-wrap")) {
            activateProcessTimeline(entry.target);
          }
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  nodes.forEach((el) => {
    if (!el.classList.contains("in")) revealObserver.observe(el);
  });

  const tlWrap = document.querySelector(".tl2-wrap");
  if (tlWrap) {
    processObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateProcessTimeline(entry.target);
            processObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    processObserver.observe(tlWrap);
  }

  revealVisibleNodes();
}

function renderAll() {
  document.documentElement.lang = state.lang;
  renderNavbar();
  const root = document.getElementById("app-root");
  if (!root) return;

  root.innerHTML = [
    renderHeroSection(),
    renderMarqueeSection(),
    renderAboutSection(),
    renderVmvSection(),
    renderBentoServicesSection(),
    renderIntakeDeskSection(),
    renderDocumentsSection(),
    renderProcessSection(),
    renderBandSection(),
    renderToolsSection(),
    renderFaqSection(),
    renderContactSection()
  ].join("");

  initScrollEffects(hasInitializedOnce);
  hasInitializedOnce = true;
}

/* ---------- Global Event Listeners ---------- */

window.addEventListener("scroll", () => {
  const sp = document.getElementById("sp");
  if (sp) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
    sp.style.width = `${pct}%`;
  }
  revealVisibleNodes();
}, { passive: true });

// Cursor-tracking gold radial spotlight on .card
document.addEventListener("pointermove", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  card.style.setProperty("--my", `${e.clientY - rect.top}px`);
});

document.addEventListener("click", (e) => {
  const langBtn = e.target.closest("[data-set-lang]");
  if (langBtn) {
    const nextLang = langBtn.getAttribute("data-set-lang");
    if (nextLang !== state.lang) {
      state.lang = nextLang;
      try { localStorage.setItem(STORAGE_LANG_KEY, nextLang); } catch {}
      renderAll();
    }
    return;
  }

  if (e.target.closest("#burger-btn")) {
    state.mobileOpen = !state.mobileOpen;
    renderNavbar();
    return;
  }

  if (e.target.closest("[data-close-mobile]")) {
    state.mobileOpen = false;
    renderNavbar();
    return;
  }

  const jumpSvc = e.target.closest("[data-jump-service]");
  if (jumpSvc) {
    state.intake.serviceId = jumpSvc.getAttribute("data-jump-service");
    state.intake.queryIndex = 0;
    state.intake.customQuery = "";
    renderAll();
    document.getElementById("intake-desk")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const pickEntJump = e.target.closest("[data-pick-entity-jump]");
  if (pickEntJump) {
    state.intake.entityId = pickEntJump.getAttribute("data-pick-entity-jump");
    renderAll();
    document.getElementById("intake-desk")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const svcTab = e.target.closest("[data-select-service]");
  if (svcTab) {
    state.intake.serviceId = svcTab.getAttribute("data-select-service");
    state.intake.queryIndex = 0;
    state.intake.customQuery = "";
    renderAll();
    return;
  }

  const qBtn = e.target.closest("[data-select-query-idx]");
  if (qBtn) {
    state.intake.queryIndex = Number(qBtn.getAttribute("data-select-query-idx"));
    renderAll();
    return;
  }

  const entBtn = e.target.closest("[data-select-entity]");
  if (entBtn) {
    state.intake.entityId = entBtn.getAttribute("data-select-entity");
    renderAll();
    return;
  }

  const remBtn = e.target.closest("[data-remove-file]");
  if (remBtn) {
    const [key, idx] = remBtn.getAttribute("data-remove-file").split(":");
    state.intake[key]?.splice(Number(idx), 1);
    renderAll();
  }
});

document.addEventListener("input", (e) => {
  const field = e.target.getAttribute("data-intake-field");
  if (field) {
    state.intake[field] = e.target.value;
    return;
  }
  if (e.target.id === "wa-q-name") state.waQuickName = e.target.value;
  if (e.target.id === "wa-q-help") state.waQuickHelp = e.target.value;
});

document.addEventListener("change", (e) => {
  const fKey = e.target.getAttribute("data-doc-filter");
  if (fKey) {
    state.docFilter[fKey] = e.target.value;
    renderAll();
    return;
  }
  const fCheck = e.target.getAttribute("data-doc-filter-check");
  if (fCheck) {
    state.docFilter[fCheck] = e.target.checked;
    renderAll();
    return;
  }
  const upTarget = e.target.getAttribute("data-upload-target");
  if (upTarget && e.target.files?.length) {
    const added = Array.from(e.target.files).map((f) => ({ name: f.name, size: formatFileSize(f.size) }));
    state.intake[upTarget].push(...added);
    showToast(state.lang === "hi" ? `${added.length} डॉक्यूमेंट संलग्न हुए।` : `${added.length} file(s) attached.`, "success");
    renderAll();
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id === "case-intake-form") {
    e.preventDefault();
    validateAndSubmitIntake();
    return;
  }
  if (e.target.id === "wa-quick-form") {
    e.preventDefault();
    const name = state.waQuickName.trim();
    const help = state.waQuickHelp.trim();
    if (!name || !help) return;
    const msg = encodeURIComponent(`Hello Prime Tax Advisor, I am ${name}. I need help with: ${help}`);
    window.open(`https://wa.me/918307918448?text=${msg}`, "_blank", "noopener");
  }
});

// Drag & Drop support
document.addEventListener("dragover", (e) => {
  const dz = e.target.closest("[data-dropzone]");
  if (!dz) return;
  e.preventDefault();
  dz.classList.add("dragover");
});

document.addEventListener("dragleave", (e) => {
  const dz = e.target.closest("[data-dropzone]");
  if (!dz) return;
  dz.classList.remove("dragover");
});

document.addEventListener("drop", (e) => {
  const dz = e.target.closest("[data-dropzone]");
  if (!dz) return;
  e.preventDefault();
  dz.classList.remove("dragover");
  const key = dz.getAttribute("data-dropzone");
  const files = e.dataTransfer?.files;
  if (key && files?.length && Array.isArray(state.intake[key])) {
    const added = Array.from(files).map((f) => ({ name: f.name, size: formatFileSize(f.size) }));
    state.intake[key].push(...added);
    showToast(state.lang === "hi" ? `${added.length} डॉक्यूमेंट संलग्न हुए।` : `${added.length} file(s) attached.`, "success");
    renderAll();
  }
});

document.getElementById("modal-close")?.addEventListener("click", closeModal);
document.getElementById("modal-backdrop")?.addEventListener("click", (e) => {
  if (e.target.id === "modal-backdrop") closeModal();
});

// Intro Preloader lifecycle
document.body.classList.add("pl-active");
renderAll();

const preloaderEl = document.getElementById("pl");
if (preloaderEl) {
  setTimeout(() => {
    preloaderEl.classList.add("done");
    document.body.classList.remove("pl-active");
    setTimeout(() => document.body.classList.add("hero-settled"), 950);
  }, 800);
} else {
  document.body.classList.remove("pl-active");
  document.body.classList.add("hero-settled");
}
