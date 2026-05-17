/* 主题切换 + 客户端搜索 */
(function () {
  // ===== 主题切换 =====
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme") || "auto";
      const next = cur === "dark" ? "light" : (cur === "light" ? "auto" : "dark");
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      btn.textContent = next === "dark" ? "☾" : (next === "light" ? "☀" : "◐");
    });
    const cur = root.getAttribute("data-theme") || "auto";
    btn.textContent = cur === "dark" ? "☾" : (cur === "light" ? "☀" : "◐");
  }

  // ===== 搜索（仅 search 页加载） =====
  const input = document.getElementById("search-input");
  if (!input || !window.SEARCH_INDEX_URL) return;

  const results = document.getElementById("search-results");
  const stats = document.getElementById("search-stats");
  const tpl = document.getElementById("result-card-tpl");
  let index = null;

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-").replace(/^-+|-+$/g, "");
  }

  fetch(window.SEARCH_INDEX_URL)
    .then(r => r.json())
    .then(data => { index = data; runSearch(input.value); })
    .catch(err => { stats.textContent = "搜索索引加载失败：" + err; });

  function score(paper, q) {
    if (!q) return 1;
    const hay = (
      paper.title + " " +
      (paper.authors || []).join(" ") + " " +
      (paper.tldr || "") + " " +
      (paper.abstract || "") + " " +
      (paper.summary || "") + " " +
      (paper.tags || []).join(" ") + " " +
      (paper.category_name || "") + " " +
      (paper.venue || "")
    ).toLowerCase();
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let s = 0;
    for (const t of terms) {
      if (!hay.includes(t)) return 0;
      // 标题命中加权
      if (paper.title.toLowerCase().includes(t)) s += 3;
      // tag 命中加权
      if ((paper.tags || []).some(x => x.toLowerCase().includes(t))) s += 2;
      s += 1;
    }
    return s;
  }

  function render(items) {
    results.innerHTML = "";
    items.forEach(p => {
      const node = tpl.content.cloneNode(true);
      const titleA = node.querySelector("[data-title-link]");
      titleA.textContent = p.title;
      titleA.href = window.BASE_URL + "/papers/" + p.id + "/";
      const cat = node.querySelector("[data-cat]");
      const catMeta = window.CATEGORY_META[p.category] || {};
      cat.textContent = (catMeta.icon || "") + " " + (catMeta.name || p.category);
      cat.classList.add("cat-" + p.category);
      const venue = node.querySelector("[data-venue]");
      venue.textContent = p.venue || "";
      const date = node.querySelector("[data-date]");
      date.textContent = p.date || "";
      const tldr = node.querySelector("[data-tldr]");
      tldr.textContent = p.tldr || "";
      const tags = node.querySelector("[data-tags]");
      (p.tags || []).forEach(t => {
        const a = document.createElement("a");
        a.className = "tag";
        a.textContent = t;
        a.href = window.BASE_URL + "/tags/" + slugify(t) + "/";
        tags.appendChild(a);
      });
      results.appendChild(node);
    });
  }

  function runSearch(q) {
    if (!index) return;
    if (!q.trim()) {
      render(index.slice(0, 30));
      stats.textContent = "未输入关键字 · 显示最新 " + Math.min(30, index.length) + " 篇 / 共 " + index.length + " 篇";
      return;
    }
    const scored = index
      .map(p => ({ p, s: score(p, q) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.p);
    render(scored.slice(0, 100));
    stats.textContent = "命中 " + scored.length + " 篇";
  }

  let t = null;
  input.addEventListener("input", e => {
    clearTimeout(t);
    t = setTimeout(() => runSearch(e.target.value), 100);
  });
})();
