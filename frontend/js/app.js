import { api } from "./api.js";
import { state, STAGES } from "./state.js";

const els = {
  jobsCount: document.getElementById("jobsCount"),
  candidatesCount: document.getElementById("candidatesCount"),
  applicationsCount: document.getElementById("applicationsCount"),
  interviewCount: document.getElementById("interviewCount"),

  jobForm: document.getElementById("jobForm"),
  candidateForm: document.getElementById("candidateForm"),
  applicationForm: document.getElementById("applicationForm"),

  jobSelect: document.getElementById("jobSelect"),
  candidateSelect: document.getElementById("candidateSelect"),

  jobsTableBody: document.getElementById("jobsTableBody"),
  candidatesTableBody: document.getElementById("candidatesTableBody"),
  pipelineBoard: document.getElementById("pipelineBoard"),

  stageFilter: document.getElementById("stageFilter"),
  searchInput: document.getElementById("searchInput"),
  toast: document.getElementById("toast")
};

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.style.background = isError ? "#b91c1c" : "#0f172a";
  els.toast.classList.remove("hidden");

  setTimeout(() => {
    els.toast.classList.add("hidden");
  }, 2500);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadAllData() {
  const [jobs, candidates, applications] = await Promise.all([
    api.getJobs(),
    api.getCandidates(),
    api.getApplications()
  ]);

  state.jobs = jobs;
  state.candidates = candidates;
  state.applications = applications;

  renderAll();
}

function renderAll() {
  renderStats();
  renderJobOptions();
  renderCandidateOptions();
  renderJobsTable();
  renderCandidatesTable();
  renderPipeline();
}

function renderStats() {
  els.jobsCount.textContent = state.jobs.length;
  els.candidatesCount.textContent = state.candidates.length;
  els.applicationsCount.textContent = state.applications.length;
  els.interviewCount.textContent = state.applications.filter(
    (item) => item.stage === "Interview"
  ).length;
}

function renderJobOptions() {
  if (!state.jobs.length) {
    els.jobSelect.innerHTML = `<option value="">No jobs available</option>`;
    return;
  }

  els.jobSelect.innerHTML = `
    <option value="">Select job</option>
    ${state.jobs
      .map(
        (job) => `<option value="${job.id}">${escapeHtml(job.title)} (${escapeHtml(job.department)})</option>`
      )
      .join("")}
  `;
}

function renderCandidateOptions() {
  if (!state.candidates.length) {
    els.candidateSelect.innerHTML = `<option value="">No candidates available</option>`;
    return;
  }

  els.candidateSelect.innerHTML = `
    <option value="">Select candidate</option>
    ${state.candidates
      .map(
        (candidate) =>
          `<option value="${candidate.id}">${escapeHtml(candidate.full_name)} (${escapeHtml(candidate.email)})</option>`
      )
      .join("")}
  `;
}

function renderJobsTable() {
  if (!state.jobs.length) {
    els.jobsTableBody.innerHTML = `
      <tr><td colspan="6" class="empty-state">No jobs found</td></tr>
    `;
    return;
  }

  els.jobsTableBody.innerHTML = state.jobs
    .map(
      (job) => `
      <tr>
        <td>${job.id}</td>
        <td>${escapeHtml(job.title)}</td>
        <td>${escapeHtml(job.department)}</td>
        <td>${escapeHtml(job.location)}</td>
        <td><span class="badge">${escapeHtml(job.status)}</span></td>
        <td>
          <button class="btn-danger delete-job" data-id="${job.id}">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderCandidatesTable() {
  if (!state.candidates.length) {
    els.candidatesTableBody.innerHTML = `
      <tr><td colspan="6" class="empty-state">No candidates found</td></tr>
    `;
    return;
  }

  els.candidatesTableBody.innerHTML = state.candidates
    .map(
      (candidate) => `
      <tr>
        <td>${candidate.id}</td>
        <td>${escapeHtml(candidate.full_name)}</td>
        <td>${escapeHtml(candidate.email)}</td>
        <td>${candidate.years_experience} yrs</td>
        <td>${escapeHtml(candidate.current_company || "-")}</td>
        <td>
          <button class="btn-danger delete-candidate" data-id="${candidate.id}">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function getFilteredApplications() {
  return state.applications.filter((app) => {
    const matchesStage =
      state.stageFilter === "All" || app.stage === state.stageFilter;

    const keyword = state.searchTerm.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      app.candidate.full_name.toLowerCase().includes(keyword) ||
      app.candidate.email.toLowerCase().includes(keyword) ||
      app.job.title.toLowerCase().includes(keyword);

    return matchesStage && matchesSearch;
  });
}

function renderPipeline() {
  const filteredApps = getFilteredApplications();

  els.pipelineBoard.innerHTML = STAGES.map((stage) => {
    const stageApps = filteredApps.filter((app) => app.stage === stage);

    return `
      <div class="stage-column">
        <h4>
          <span>${stage}</span>
          <span class="stage-count">${stageApps.length}</span>
        </h4>

        ${
          stageApps.length
            ? stageApps
                .map(
                  (app) => `
                  <div class="application-card">
                    <h5>${escapeHtml(app.candidate.full_name)}</h5>
                    <p><strong>Job:</strong> ${escapeHtml(app.job.title)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(app.candidate.email)}</p>
                    <p><strong>Notes:</strong> ${escapeHtml(app.notes || "-")}</p>

                    <div class="application-actions">
                      <select class="stage-select" data-id="${app.id}">
                        ${STAGES.map(
                          (currentStage) => `
                          <option value="${currentStage}" ${app.stage === currentStage ? "selected" : ""}>
                            ${currentStage}
                          </option>
                        `
                        ).join("")}
                      </select>

                      <div class="inline-actions">
                        <button class="btn-danger delete-application" data-id="${app.id}">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                `
                )
                .join("")
            : `<div class="empty-state">No applications</div>`
        }
      </div>
    `;
  }).join("");
}

function getFormDataAsObject(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

async function handleJobSubmit(event) {
  event.preventDefault();

  try {
    const payload = getFormDataAsObject(els.jobForm);
    await api.createJob(payload);
    els.jobForm.reset();
    await loadAllData();
    showToast("Job created successfully");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleCandidateSubmit(event) {
  event.preventDefault();

  try {
    const payload = getFormDataAsObject(els.candidateForm);
    payload.years_experience = Number(payload.years_experience || 0);

    await api.createCandidate(payload);
    els.candidateForm.reset();
    await loadAllData();
    showToast("Candidate created successfully");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleApplicationSubmit(event) {
  event.preventDefault();

  try {
    const payload = getFormDataAsObject(els.applicationForm);
    payload.job_id = Number(payload.job_id);
    payload.candidate_id = Number(payload.candidate_id);

    await api.createApplication(payload);
    els.applicationForm.reset();
    await loadAllData();
    showToast("Application created successfully");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleJobsTableClick(event) {
  const button = event.target.closest(".delete-job");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (!confirm("Delete this job?")) return;

  try {
    await api.deleteJob(id);
    await loadAllData();
    showToast("Job deleted");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleCandidatesTableClick(event) {
  const button = event.target.closest(".delete-candidate");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (!confirm("Delete this candidate?")) return;

  try {
    await api.deleteCandidate(id);
    await loadAllData();
    showToast("Candidate deleted");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handlePipelineClick(event) {
  const button = event.target.closest(".delete-application");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (!confirm("Delete this application?")) return;

  try {
    await api.deleteApplication(id);
    await loadAllData();
    showToast("Application deleted");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handlePipelineChange(event) {
  const select = event.target.closest(".stage-select");
  if (!select) return;

  const id = Number(select.dataset.id);
  const app = state.applications.find((item) => item.id === id);

  if (!app) return;

  try {
    await api.updateApplication(id, {
      stage: select.value,
      notes: app.notes || ""
    });

    await loadAllData();
    showToast("Application stage updated");
  } catch (error) {
    showToast(error.message, true);
  }
}

function bindEvents() {
  els.jobForm.addEventListener("submit", handleJobSubmit);
  els.candidateForm.addEventListener("submit", handleCandidateSubmit);
  els.applicationForm.addEventListener("submit", handleApplicationSubmit);

  els.jobsTableBody.addEventListener("click", handleJobsTableClick);
  els.candidatesTableBody.addEventListener("click", handleCandidatesTableClick);
  els.pipelineBoard.addEventListener("click", handlePipelineClick);
  els.pipelineBoard.addEventListener("change", handlePipelineChange);

  els.stageFilter.addEventListener("change", (event) => {
    state.stageFilter = event.target.value;
    renderPipeline();
  });

  els.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderPipeline();
  });
}

async function init() {
  bindEvents();

  try {
    await loadAllData();
  } catch (error) {
    showToast("Backend not running or data load failed", true);
    console.error(error);
  }
}

init();