const initialThreads = [
  {
    id: crypto.randomUUID(),
    title: "この掲示板について語るスレ",
    posts: [
      {name: "名無しさん", body: "テスト投稿です。", date: new Date().toLocaleString("ja-JP")}
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "プログラミング初心者質問スレ",
    posts: [
      {name: "名無しさん", body: "HTML/CSS/JavaScriptから始めるのが分かりやすいと思う。", date: new Date().toLocaleString("ja-JP")}
    ]
  }
];

let threads = JSON.parse(localStorage.getItem("board_threads") || "null") || initialThreads;
let selectedId = threads[0]?.id;

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem("board_threads", JSON.stringify(threads));
}

function renderThreads() {
  const el = $("threadList");
  if (!threads.length) {
    el.innerHTML = '<div class="empty">まだスレッドがありません。</div>';
    return;
  }
  el.innerHTML = threads.map(t => `
    <div class="thread ${t.id === selectedId ? "selected" : ""}" data-id="${t.id}">
      <div class="thread-title">${escapeHtml(t.title)}</div>
      <div class="thread-meta">レス ${t.posts.length}件</div>
    </div>
  `).join("");
  el.querySelectorAll(".thread").forEach(x => {
    x.addEventListener("click", () => {
      selectedId = x.dataset.id;
      renderAll();
    });
  });
}

function renderPosts() {
  const el = $("posts");
  const thread = threads.find(t => t.id === selectedId);
  if (!thread) {
    el.innerHTML = '<div class="empty">スレッドを選択してください。</div>';
    return;
  }
  el.innerHTML = `
    <div class="post">
      <div class="post-head"><b>${escapeHtml(thread.title)}</b></div>
    </div>
  ` + thread.posts.map((p, i) => `
    <div class="post">
      <div class="post-head">
        <span class="post-no">${i + 1}</span> ：
        <b>${escapeHtml(p.name || "名無しさん")}</b>
        ${escapeHtml(p.date || "")}
      </div>
      <div class="post-body">${escapeHtml(p.body)}</div>
    </div>
  `).join("");
}

function renderAll() {
  renderThreads();
  renderPosts();
  save();
}

$("threadForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("threadTitle").value.trim();
  const body = $("threadBody").value.trim();
  if (!title || !body) return;
  const thread = {
    id: crypto.randomUUID(),
    title,
    posts: [{name: "名無しさん", body, date: new Date().toLocaleString("ja-JP")}]
  };
  threads.unshift(thread);
  selectedId = thread.id;
  $("threadTitle").value = "";
  $("threadBody").value = "";
  renderAll();
});

$("postForm").addEventListener("submit", e => {
  e.preventDefault();
  const thread = threads.find(t => t.id === selectedId);
  const body = $("body").value.trim();
  if (!thread || !body) return;
  thread.posts.push({
    name: $("name").value.trim() || "名無しさん",
    body,
    date: new Date().toLocaleString("ja-JP")
  });
  $("body").value = "";
  renderAll();
});

$("aiForm").addEventListener("submit", async e => {
  e.preventDefault();
  const input = $("aiInput");
  const text = input.value.trim();
  if (!text) return;

  addAiMessage(text, "user");
  input.value = "";

  const base = (window.APP_CONFIG?.AI_BACKEND_URL || "").replace(/\/$/, "");
  if (!base) {
    addAiMessage(
      "AIバックエンドが未設定です。config.js の AI_BACKEND_URL にバックエンドURLを設定してください。\\n\\nGitHub Pagesは静的ホスティングなので、APIキーをブラウザ側に置くのは危険です。",
      "bot"
    );
    return;
  }

  $("aiStatus").textContent = "AIに問い合わせ中...";
  try {
    const res = await fetch(base + "/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message: text})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
    addAiMessage(data.reply || "返答がありませんでした。", "bot");
    $("aiStatus").textContent = "AI接続: OK";
  } catch (err) {
    addAiMessage("AIへの接続に失敗しました: " + err.message, "bot");
    $("aiStatus").textContent = "AI接続: エラー";
  }
});

function addAiMessage(text, type) {
  const el = document.createElement("div");
  el.className = "ai-msg " + type;
  el.textContent = text;
  $("aiMessages").appendChild(el);
  $("aiMessages").scrollTop = $("aiMessages").scrollHeight;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

$("aiStatus").textContent =
  window.APP_CONFIG?.AI_BACKEND_URL ? "AI接続先: 設定済み" : "AI接続先: 未設定";

renderAll();
