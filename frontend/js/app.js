import { api } from "./api.js";
import { state, STAGES } from "./state.js";

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  jobsCount: $("jobsCount"),
  candidatesCount: $("candidatesCount"),
  applicationsCount: $("applicationsCount"),
  interviewCount: $("interviewCount"),
  jobForm: $("jobForm"),
  candidateForm: $("candidateForm"),
  applicationForm: $("applicationForm"),
  jobSelect: $("jobSelect"),
  candidateSelect: $("candidateSelect"),
  jobsTableBody: $("jobsTableBody"),
  candidatesTableBody: $("candidatesTableBody"),
  pipelineBoard: $("pipelineBoard"),
  stageFilter: $("stageFilter"),
  searchInput: $("searchInput"),
  toast: $("toast"),
  recentJobs: $("recentJobs"),
  recentCandidates: $("recentCandidates"),
  stageSummary: $("stageSummary"),
  viewTitle: $("viewTitle"),
  viewSubtitle: $("viewSubtitle"),
  currentTime: $("currentTime"),
  menuToggle: $("menuToggle"),
  sidebar: $("sidebar")
};

const META = {
  dashboard: { title: "Dashboard", sub: "Overview of hiring operations" },
  jobs: { title: "Jobs", sub: "Create and manage open positions" },
  candidates: { title: "Candidates", sub: "Track candidate profiles and skills" },
  applications: { title: "Pipeline", sub: "Monitor applications across all stages" }
};

const esc = (v = "") =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function toast(msg, err = false) {
  els.toast.textContent = msg;
  els.toast.style.background = err ? "#dc2626" : "#0f172a";
  els.toast.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.add("hidden"), 2600);
}

function updateClock() {
  els.currentTime.textContent = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function switchView(name) {
  $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
  els.viewTitle.textContent = META[name].title;
  els.viewSubtitle.textContent = META[name].sub;
  els.sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function load() {
  const [jobs, candidates, applications] = await Promise.all([
    api.getJobs(),
    api.getCandidates(),
    api.getApplications()
  ]);
  state.jobs = jobs;
  state.candidates = candidates;
  state.applications = applications;
  render();
}

function render() {
  renderStats();
  renderRecentJobs();
  renderRecentCandidates();
  renderStageSummary();
  renderJobOpts();
  renderCandidateOpts();
  renderJobsTable();
  renderCandidatesTable();
  renderPipeline();
}

function renderStats() {
  els.jobsCount.textContent = state.jobs.length;
  els.candidatesCount.textContent = state.candidates.length;
  els.applicationsCount.textContent = state.applications.length;
  els.interviewCount.textContent = state.applications.filter((a) => a.stage === "Interview").length;
}

function renderRecentJobs() {
  const jobs = state.jobs.slice(0, 5);
  els.recentJobs.innerHTML = jobs.length
    ? jobs.map((j) => `
        <div class="stack-item">
          <h4>${esc(j.title)}</h4>
          <p>${esc(j.department)} · ${esc(j.location)} · <strong>${esc(j.status)}</strong></p>
        </div>`).join("")
    : `<div class="empty">No jobs yet</div>`;
}

function renderRecentCandidates() {
  const list = state.candidates.slice(0, 5);
  els.recentCandidates.innerHTML = list.length
    ? list.map((c) => `
        <div class="stack-item">
          <h4>${esc(c.full_name)}</h4>
          <p>${esc(c.email)} · ${c.years_experience} yrs</p>
        </div>`).join("")
    : `<div class="empty">No candidates yet</div>`;
}

function renderStageSummary() {
  els.stageSummary.innerHTML = STAGES.map((s) => {
    const count = state.applications.filter((a) => a.stage === s).length;
    return `<div class="summary-row"><span class="label">${s}</span><span class="count">${count}</span></div>`;
  }).join("");
}

function renderJobOpts() {
  els.jobSelect.innerHTML = state.jobs.length
    ? `<option value="">Choose a job posting</option>${state.jobs
        .map((j) => `<option value="${j.id}">${esc(j.title)} — ${esc(j.department)}</option>`)
        .join("")}`
    : `<option value="">No jobs available</option>`;
}

function renderCandidateOpts() {
  els.candidateSelect.innerHTML = state.candidates.length
    ? `<option value="">Choose a candidate</option>${state.candidates
        .map((c) => `<option value="${c.id}">${esc(c.full_name)} — ${esc(c.email)}</option>`)
        .join("")}`
    : `<option value="">No candidates available</option>`;
}

function statusBadge(status) {
  const s = (status || "").toLowerCase();
  if (s === "open") return `<span class="badge badge-open">${esc(status)}</span>`;
  if (s === "closed") return `<span class="badge badge-closed">${esc(status)}</span>`;
  if (s.includes("hold")) return `<span class="badge badge-hold">${esc(status)}</span>`;
  return `<span class="badge badge-default">${esc(status)}</span>`;
}

function skillTags(skills) {
  if (!skills) return `<span style="color:#9ca3af">—</span>`;
  return `<div class="skills-tags">${skills.split(",").map((s) => `<span class="skill-tag">${esc(s.trim())}</span>`).join("")}</div>`;
}

function renderJobsTable() {
  els.jobsTableBody.innerHTML = state.jobs.length
    ? state.jobs.map((j) => `
        <tr>
          <td>${j.id}</td>
          <td><strong>${esc(j.title)}</strong></td>
          <td>${esc(j.department)}</td>
          <td>${esc(j.location)}</td>
          <td>${esc(j.employment_type)}</td>
          <td>${statusBadge(j.status)}</td>
          <td><button class="btn btn-danger del-job" data-id="${j.id}">Delete</button></td>
        </tr>`).join("")
    : `<tr><td colspan="7" class="empty">No jobs found</td></tr>`;
}

function renderCandidatesTable() {
  els.candidatesTableBody.innerHTML = state.candidates.length
    ? state.candidates.map((c) => `
        <tr>
          <td>${c.id}</td>
          <td><strong>${esc(c.full_name)}</strong></td>
          <td>${esc(c.email)}</td>
          <td>${c.years_experience} yrs</td>
          <td>${esc(c.current_company || "—")}</td>
          <td>${skillTags(c.skills)}</td>
          <td><button class="btn btn-danger del-cand" data-id="${c.id}">Delete</button></td>
        </tr>`).join("")
    : `<tr><td colspan="7" class="empty">No candidates found</td></tr>`;
}

function filtered() {
  return state.applications.filter((a) => {
    const stageOk = state.stageFilter === "All" || a.stage === state.stageFilter;
    const kw = state.searchTerm.trim().toLowerCase();
    const searchOk =
      !kw ||
      a.candidate.full_name.toLowerCase().includes(kw) ||
      a.candidate.email.toLowerCase().includes(kw) ||
      a.job.title.toLowerCase().includes(kw);
    return stageOk && searchOk;
  });
}

function renderPipeline() {
  const apps = filtered();
  els.pipelineBoard.innerHTML = STAGES.map((stage) => {
    const list = apps.filter((a) => a.stage === stage);
    return `
      <div class="stage-col">
        <div class="stage-head">
          <h4>${stage}</h4>
          <span class="stage-badge">${list.length}</span>
        </div>
        ${list.length
          ? list.map((a) => `
              <div class="app-card">
                <h5>${esc(a.candidate.full_name)}</h5>
                <p><strong>Job:</strong> ${esc(a.job.title)}</p>
                <p><strong>Email:</strong> ${esc(a.candidate.email)}</p>
                <p><strong>Notes:</strong> ${esc(a.notes || "—")}</p>
                <div class="app-card-actions">
                  <select class="stage-sel" data-id="${a.id}">
                    ${STAGES.map((s) => `<option value="${s}" ${a.stage === s ? "selected" : ""}>${s}</option>`).join("")}
                  </select>
                  <button class="btn btn-danger del-app" data-id="${a.id}">Remove</button>
                </div>
              </div>`).join("")
          : `<div class="empty">No applications</div>`}
      </div>`;
  }).join("");
}

const formData = (form) => Object.fromEntries(new FormData(form).entries());

async function onJobSubmit(e) {
  e.preventDefault();
  try {
    await api.createJob(formData(els.jobForm));
    els.jobForm.reset();
    await load();
    toast("Job created successfully");
  } catch (err) { toast(err.message, true); }
}

async function onCandidateSubmit(e) {
  e.preventDefault();
  try {
    const d = formData(els.candidateForm);
    d.years_experience = Number(d.years_experience || 0);
    await api.createCandidate(d);
    els.candidateForm.reset();
    await load();
    toast("Candidate added successfully");
  } catch (err) { toast(err.message, true); }
}

async function onAppSubmit(e) {
  e.preventDefault();
  try {
    const d = formData(els.applicationForm);
    d.job_id = Number(d.job_id);
    d.candidate_id = Number(d.candidate_id);
    await api.createApplication(d);
    els.applicationForm.reset();
    await load();
    toast("Application submitted");
  } catch (err) { toast(err.message, true); }
}

async function onDelJob(e) {
  const b = e.target.closest(".del-job");
  if (!b || !confirm("Delete this job?")) return;
  try { await api.deleteJob(Number(b.dataset.id)); await load(); toast("Job deleted"); }
  catch (err) { toast(err.message, true); }
}

async function onDelCand(e) {
  const b = e.target.closest(".del-cand");
  if (!b || !confirm("Delete this candidate?")) return;
  try { await api.deleteCandidate(Number(b.dataset.id)); await load(); toast("Candidate deleted"); }
  catch (err) { toast(err.message, true); }
}

async function onPipeClick(e) {
  const b = e.target.closest(".del-app");
  if (!b || !confirm("Remove this application?")) return;
  try { await api.deleteApplication(Number(b.dataset.id)); await load(); toast("Application removed"); }
  catch (err) { toast(err.message, true); }
}

async function onPipeChange(e) {
  const sel = e.target.closest(".stage-sel");
  if (!sel) return;
  const id = Number(sel.dataset.id);
  const app = state.applications.find((a) => a.id === id);
  if (!app) return;
  try {
    await api.updateApplication(id, { stage: sel.value, notes: app.notes || "" });
    await load();
    toast("Stage updated");
  } catch (err) { toast(err.message, true); }
}

function bind() {
  els.jobForm.addEventListener("submit", onJobSubmit);
  els.candidateForm.addEventListener("submit", onCandidateSubmit);
  els.applicationForm.addEventListener("submit", onAppSubmit);
  els.jobsTableBody.addEventListener("click", onDelJob);
  els.candidatesTableBody.addEventListener("click", onDelCand);
  els.pipelineBoard.addEventListener("click", onPipeClick);
  els.pipelineBoard.addEventListener("change", onPipeChange);
  els.stageFilter.addEventListener("change", (e) => { state.stageFilter = e.target.value; renderPipeline(); });
  els.searchInput.addEventListener("input", (e) => { state.searchTerm = e.target.value; renderPipeline(); });

  $$(".nav-btn").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));
  $$(".chip").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));

  els.menuToggle.addEventListener("click", () => els.sidebar.classList.toggle("open"));
}

async function init() {
  bind();
  switchView("dashboard");
  updateClock();
  setInterval(updateClock, 30000);
  try { await load(); }
  catch (err) { console.error(err); toast("Failed to connect to backend", true); }
}

init();