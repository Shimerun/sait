document.addEventListener("DOMContentLoaded", () => {
  const { denyIcon, allowIcon, linkIcon, levels, denyItems, allowItems, principles, badExamples, goodExamples, quiz, faq } = window.siteData;

  const searchIndex = [];
  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panel");
  const levelsContainer = document.getElementById("levels-container");
  const quizContainer = document.getElementById("quiz-container");
  const faqContainer = document.getElementById("faq-container");
  const searchInput = document.getElementById("site-search");
  const searchResults = document.getElementById("search-results");
  const progressBar = document.getElementById("progress-bar");
  const toast = document.getElementById("toast");
  const themeToggle = document.getElementById("theme-toggle");

  function renderLevels() {
    levels.forEach((lvl, idx) => {
      const details = document.createElement("details");
      details.className = "level-group";
      if (idx === 0) details.open = true;

      const dots = [0, 1, 2, 3].map(i => `<i class="${i <= idx ? "on" : ""}"></i>`).join("");
      const summary = document.createElement("summary");
      summary.innerHTML = `<span class="level-dots">${dots}</span><span>${lvl.label}</span><span class="range">${lvl.range}</span><span class="chev"></span>`;
      details.appendChild(summary);

      lvl.items.forEach(item => {
        const row = document.createElement("div");
        row.className = "grade-row";
        row.id = `grade-${item.b}`;
        row.innerHTML = `<div class="grade-num">${item.b}</div><div class="grade-text">${item.text}</div><button class="row-link" data-copy="#grade-${item.b}" title="Скопіювати посилання на цей бал">${linkIcon}</button>`;
        details.appendChild(row);
        searchIndex.push({ tab: "grading", elId: `grade-${item.b}`, parentDetails: details, text: `${item.b} балів — ${item.text}` });
      });

      levelsContainer.appendChild(details);
    });
  }

  function fillList(elId, items, icon, tab, prefix) {
    const ul = document.getElementById(elId);
    items.forEach((text, i) => {
      const li = document.createElement("li");
      const rowId = `${prefix}-${i}`;
      li.id = rowId;
      li.innerHTML = `<span class="mark">${icon}</span><span>${text}</span>`;
      ul.appendChild(li);
      searchIndex.push({ tab, elId: rowId, parentDetails: null, text });
    });
  }

  function renderPrinciples() {
    const pGrid = document.getElementById("principle-grid");
    principles.forEach((p, i) => {
      const card = document.createElement("div");
      const id = `principle-${i}`;
      card.className = "principle-card";
      card.id = id;
      card.innerHTML = `<p class="p-title">${p.t}</p><p class="p-desc">${p.d}</p>`;
      pGrid.appendChild(card);
      searchIndex.push({ tab: "integrity", elId: id, parentDetails: null, text: `${p.t} — ${p.d}` });
    });
  }

  function renderQuiz() {
    quiz.forEach((item, qi) => {
      const block = document.createElement("div");
      block.className = "quiz-q";
      block.id = `quiz-${qi}`;
      const optsHtml = item.opts.map((option, oi) => `
        <label><input type="radio" name="q${qi}" value="${oi}"> ${option}</label>
      `).join("");
      block.innerHTML = `<p class="q-title">${qi + 1}. ${item.q}</p>${optsHtml}<div class="q-feedback"></div>`;
      quizContainer.appendChild(block);
    });

    document.getElementById("quiz-check").addEventListener("click", () => {
      let score = 0;
      quiz.forEach((item, qi) => {
        const block = document.getElementById(`quiz-${qi}`);
        const chosen = block.querySelector(`input[name="q${qi}"]:checked`);
        block.classList.add("graded");
        const fb = block.querySelector(".q-feedback");
        block.classList.remove("correct", "incorrect");

        if (chosen && Number(chosen.value) === item.correct) {
          score++;
          block.classList.add("correct");
          fb.textContent = "Правильно.";
        } else {
          block.classList.add("incorrect");
          fb.textContent = `Правильна відповідь: ${item.opts[item.correct]}.`;
        }
      });

      document.getElementById("quiz-score").textContent = `Результат: ${score} / ${quiz.length}`;
    });

    document.getElementById("quiz-reset").addEventListener("click", () => {
      quiz.forEach((item, qi) => {
        const block = document.getElementById(`quiz-${qi}`);
        block.classList.remove("graded", "correct", "incorrect");
        block.querySelectorAll("input[type=radio]").forEach(radio => radio.checked = false);
      });
      document.getElementById("quiz-score").textContent = "";
    });
  }

  function renderFaq() {
    faq.forEach((item, i) => {
      const details = document.createElement("details");
      const id = `faq-${i}`;
      details.className = "faq-item";
      details.id = id;
      details.innerHTML = `<summary><span>${item.q}</span><span class="chev"></span></summary><div class="faq-a">${item.a}</div>`;
      faqContainer.appendChild(details);
      searchIndex.push({ tab: "faq", elId: id, parentDetails: details, text: `${item.q} ${item.a}` });
    });
  }

  function goToTab(tabName) {
    tabButtons.forEach(btn => btn.setAttribute("aria-selected", btn.dataset.tab === tabName ? "true" : "false"));
    panels.forEach(panel => panel.classList.toggle("active", panel.id === tabName));
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function jumpTo(tab, elId) {
    goToTab(tab);
    requestAnimationFrame(() => {
      const el = document.getElementById(elId);
      if (!el) return;
      if (el.closest("details")) el.closest("details").open = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("flash");
      setTimeout(() => el.classList.remove("flash"), 1500);
    });
  }

  renderLevels();
  fillList("deny-list", denyItems, denyIcon, "safety", "deny");
  fillList("allow-list", allowItems, allowIcon, "safety", "allow");
  renderPrinciples();
  fillList("bad-list", badExamples, denyIcon, "integrity", "badex");
  fillList("good-list", goodExamples, allowIcon, "integrity", "goodex");
  renderQuiz();
  renderFaq();

  tabButtons.forEach(btn => btn.addEventListener("click", () => {
    goToTab(btn.dataset.tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));

  document.querySelectorAll("[data-goto]").forEach(el => {
    el.addEventListener("click", () => {
      goToTab(el.dataset.goto);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.addEventListener("click", (event) => {
    const btn = event.target.closest(".row-link");
    if (!btn) return;
    const hash = btn.dataset.copy;
    const url = `${location.origin}${location.pathname}${hash}`;
    history.replaceState(null, "", hash);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast("Посилання скопійовано"));
    } else {
      showToast(`Посилання: ${url}`);
    }
  });

  document.getElementById("share-btn").addEventListener("click", () => {
    const url = `${location.origin}${location.pathname}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast("Посилання на сайт скопійовано"));
    } else {
      showToast(url);
    }
  });

  document.getElementById("print-btn").addEventListener("click", () => window.print());

  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
  });

  const zoomLevels = [1, 1.12, 1.24];
  let zoomIdx = 0;
  const mainEl = document.querySelector("main");
  function applyZoom() { mainEl.style.zoom = zoomLevels[zoomIdx]; }
  document.getElementById("fs-plus").addEventListener("click", () => { zoomIdx = Math.min(zoomIdx + 1, zoomLevels.length - 1); applyZoom(); });
  document.getElementById("fs-minus").addEventListener("click", () => { zoomIdx = Math.max(zoomIdx - 1, 0); applyZoom(); });

  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    progressBar.style.width = height > 0 ? `${(scrolled / height * 100)}%` : "0%";
  });

  const tabLabels = { grading: "Критерії", safety: "Робота з ПК", integrity: "Доброчесність", faq: "FAQ" };
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      return;
    }

    const matches = searchIndex.filter(item => item.text.toLowerCase().includes(q)).slice(0, 8);
    searchResults.innerHTML = "";

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">Нічого не знайдено</div>';
    } else {
      matches.forEach(match => {
        const div = document.createElement("div");
        div.className = "search-item";
        const snippet = match.text.length > 110 ? `${match.text.slice(0,110)}…` : match.text;
        div.innerHTML = `<span class="si-tab">${tabLabels[match.tab] || match.tab}</span><span class="si-text">${snippet}</span>`;
        div.addEventListener("mousedown", () => {
          jumpTo(match.tab, match.elId);
          searchResults.hidden = true;
          searchInput.blur();
        });
        searchResults.appendChild(div);
      });
    }

    searchResults.hidden = false;
  });

  searchInput.addEventListener("blur", () => setTimeout(() => { searchResults.hidden = true; }, 150));
  searchInput.addEventListener("focus", () => { if (searchInput.value.trim().length >= 2) searchResults.hidden = false; });

  window.addEventListener("DOMContentLoaded", () => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    if (hash.startsWith("grade-")) {
      jumpTo("grading", hash);
    } else if (document.getElementById(hash) && document.querySelector(`.tab-btn[data-tab="${hash}"]`)) {
      goToTab(hash);
    }
  });
});
