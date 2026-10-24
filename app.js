"use strict";

// StormWise Quiz. All quiz content lives in content.json so it can be
// edited without touching code. If content.json cannot be fetched
// (for example when opening index.html as a file), the embedded
// fallback below is used; keep the two in sync.

let content = null;
let state = { scenario: null, index: 0, score: 0, answered: false };

const $ = (id) => document.getElementById(id);

async function loadContent() {
  try {
    const res = await fetch("content.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    const el = document.createElement("script");
    el.src = "content-fallback.js";
    document.body.appendChild(el);
    return await new Promise((resolve) => {
      const t = setInterval(() => {
        if (window.STORMWISE_CONTENT) { clearInterval(t); resolve(window.STORMWISE_CONTENT); }
      }, 50);
      setTimeout(() => { clearInterval(t); resolve(window.STORMWISE_CONTENT || null); }, 3000);
    });
  }
}

function show(screenId) {
  for (const id of ["screen-home", "screen-quiz", "screen-results"]) {
    $(id).hidden = id !== screenId;
  }
  window.scrollTo({ top: 0 });
}

function renderHome() {
  $("app-title").textContent = content.appTitle;
  $("app-subtitle").textContent = content.appSubtitle;
  $("app-intro").textContent = content.intro;
  const grid = $("scenario-grid");
  grid.innerHTML = "";
  for (const sc of content.scenarios) {
    const card = document.createElement("article");
    card.className = "scenario-card";
    card.innerHTML = "";
    const icon = document.createElement("div"); icon.className = "icon"; icon.textContent = sc.icon;
    const h = document.createElement("h3"); h.textContent = sc.title;
    const p = document.createElement("p"); p.textContent = sc.tagline;
    const meta = document.createElement("p"); meta.textContent = sc.questions.length + " questions";
    const btn = document.createElement("button");
    btn.className = "btn primary"; btn.type = "button"; btn.textContent = "Start scenario";
    btn.addEventListener("click", () => startScenario(sc.id));
    card.append(icon, h, p, meta, btn);
    grid.appendChild(card);
  }
  show("screen-home");
}

function startScenario(id) {
  state = { scenario: content.scenarios.find((s) => s.id === id), index: 0, score: 0, answered: false };
  renderQuestion();
  show("screen-quiz");
}

function renderQuestion() {
  const sc = state.scenario;
  const q = sc.questions[state.index];
  state.answered = false;
  $("quiz-scenario-title").textContent = sc.icon + " " + sc.title;
  $("progress-bar").style.width = ((state.index) / sc.questions.length) * 100 + "%";
  $("progress-text").textContent = "Question " + (state.index + 1) + " of " + sc.questions.length + " · Score so far: " + state.score;
  $("question-text").textContent = q.question;
  $("feedback").hidden = true;
  $("btn-next").hidden = true;
  $("btn-next").textContent = state.index === sc.questions.length - 1 ? "See my results" : "Next question";
  const box = $("options");
  box.innerHTML = "";
  q.options.forEach((text, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "option"; b.textContent = text;
    b.addEventListener("click", () => answer(i));
    box.appendChild(b);
  });
}

function answer(i) {
  if (state.answered) return;
  state.answered = true;
  const q = state.scenario.questions[state.index];
  const correct = i === q.answerIndex;
  if (correct) state.score++;
  const buttons = $("options").querySelectorAll(".option");
  buttons.forEach((b, bi) => {
    b.disabled = true;
    if (bi === q.answerIndex) b.classList.add("correct");
    else if (bi === i) b.classList.add("wrong");
  });
  const verdict = $("feedback-verdict");
  verdict.textContent = correct ? "Correct. Well done." : "Not quite. The correct answer is highlighted above.";
  verdict.className = "verdict " + (correct ? "good" : "bad");
  $("feedback-explanation").textContent = q.explanation;
  const src = $("feedback-source");
  src.textContent = q.source.label; src.href = q.source.url;
  $("feedback").hidden = false;
  $("btn-next").hidden = false;
  $("progress-bar").style.width = ((state.index + 1) / state.scenario.questions.length) * 100 + "%";
}

function next() {
  if (state.index < state.scenario.questions.length - 1) {
    state.index++;
    renderQuestion();
  } else {
    renderResults();
  }
}

function renderResults() {
  const sc = state.scenario;
  const total = sc.questions.length;
  $("result-title").textContent = sc.title + ": scenario complete";
  $("result-score").textContent = state.score + " / " + total;
  $("result-message").textContent =
    state.score === total ? "Perfect score. You know how to stay safe in this scenario. Try another one, or share what you learned." :
    state.score === total - 1 ? "Strong result. Read the one explanation you missed and you have this scenario covered." :
    "Good start. Re-read the explanations and the official guidance, then try the scenario again.";
  const src = $("result-source");
  src.textContent = sc.source.label; src.href = sc.source.url;
  show("screen-results");
}

document.addEventListener("DOMContentLoaded", async () => {
  content = await loadContent();
  if (!content) {
    document.querySelector("main").innerHTML = "<p>Sorry, the quiz content could not be loaded. Please serve this folder with a local web server (see README) and reload.</p>";
    return;
  }
  $("btn-next").addEventListener("click", next);
  $("btn-quit").addEventListener("click", renderHome);
  $("btn-restart").addEventListener("click", () => startScenario(state.scenario.id));
  $("btn-home").addEventListener("click", renderHome);
  renderHome();
});
