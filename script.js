/**
 * Resume Builder Application
 * A client-side application for creating and previewing resumes
 * 
 * @version 2.0.0
 * @author Interactive Resume Builder Team
 */

// Configuration object with constants
const CONFIG = {
  storageKey: "resumeData",
  selectors: {
    form: "#resume-form",
    preview: "#resume-preview",
    previewContent: "#preview-content",
    skillInput: "#skill",
    skillsList: "#skills-list",
    addSkillButton: "#add-skill-btn",
    downloadPdfButton: "#download-pdf",
    printResumeButton: "#print-resume",
    clearFormButton: "#clear-form",
    aiAgentInfo: "#ai-agent-info",
  },
  requiredFields: ["name", "email"],
  optionalFields: ["phone", "bio", "education"],
  notificationDuration: 3000,
  skillDeleteIcon: "×", // Centralized delete icon
};

class ResumeBuilder {
  constructor() {
    this.elements = {};
    this.skills = [];
    this.experiences = [];
    this.experienceCounter = 0;

    this.initializeApp();
  }

  /**
   * Initialize the application
   */
  initializeApp() {
    this.cacheDOM();

    if (!this.validateElementsExist()) {
      console.error("Required DOM elements not found");
      return;
    }

    this.bindEvents();
    this.loadSavedData();
    this.detectAndDisplayAIAgent();
    
    // Add initial experience entry if none exist
    const experiencesList = document.getElementById("experiences-list");
    if (experiencesList && experiencesList.children.length === 0) {
      this.addExperienceEntry();
    }
  }

  /**
   * Cache DOM elements for reuse
   */
  cacheDOM() {
    const { selectors } = CONFIG;

    for (const key in selectors) {
      this.elements[key] = document.querySelector(selectors[key]);
    }
  }

  /**
   * Validate that required elements exist in the DOM
   */
  validateElementsExist() {
    const { form, preview, previewContent } = this.elements;
    if (!form || !preview || !previewContent) {
      this.showNotification(
        "A critical error occurred: some UI elements are missing.",
        "error",
      );
      return false;
    }
    return true;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const addClickListener = (element, handler) => {
      if (element) {
        element.addEventListener("click", handler.bind(this));
      }
    };

    if (this.elements.form) {
      this.elements.form.addEventListener(
        "submit",
        this.handleFormSubmit.bind(this),
      );
    }

    addClickListener(this.elements.addSkillButton, this.handleAddSkill);
    addClickListener(this.elements.skillsList, this.handleSkillDelete);
    addClickListener(this.elements.downloadPdfButton, this.handleDownloadPdf);
    addClickListener(this.elements.printResumeButton, this.handlePrintResume);
    addClickListener(this.elements.clearFormButton, this.handleClearForm);

    // Experience handlers
    const addExpBtn = document.getElementById("add-experience-btn");
    if (addExpBtn) {
      addExpBtn.addEventListener("click", this.handleAddExperience.bind(this));
    }

    const experiencesList = document.getElementById("experiences-list");
    if (experiencesList) {
      experiencesList.addEventListener("click", this.handleExperienceDelete.bind(this));
    }

    // Import handlers
    this.setupImportHandlers();
  }

  /**
   * Handle form submission
   */
  handleFormSubmit(event) {
    event.preventDefault();

    const formData = this.collectFormData();

    if (!this.validateFormData(formData)) {
      return this.showNotification(
        "Please fill in all required fields.",
        "error",
      );
    }

    this.saveToLocalStorage(formData);
    this.updateResumePreview(formData);
    this.showNotification("Resume updated successfully!", "success");
  }

  /**
   * Collect form data from inputs
   */
  collectFormData() {
    const data = {};
    const allFields = [...CONFIG.requiredFields, ...CONFIG.optionalFields];

    allFields.forEach((field) => {
      const input = this.elements.form.querySelector(`[name="${field}"]`);
      data[field] = input ? input.value.trim() : "";
    });

    data.skills = this.getSkills();
    data.experiences = this.getExperiences();
    return data;
  }

  /**
   * Validate that all required fields have values
   */
  validateFormData(data) {
    return CONFIG.requiredFields.every((field) => data[field]?.trim());
  }

  /**
   * Get current skills from the skills list
   */
  getSkills() {
    if (!this.elements.skillsList) return [];

    return Array.from(this.elements.skillsList.children)
      .map((item) =>
        item.textContent.replace(CONFIG.skillDeleteIcon, "").trim(),
      )
      .filter(Boolean);
  }

  /**
   * Handle adding a new skill
   */
  handleAddSkill() {
    if (!this.elements.skillInput || !this.elements.skillsList) return;

    const skill = this.elements.skillInput.value.trim();
    const currentSkills = this.getSkills();

    if (!skill) {
      return this.showNotification("Please enter a skill.", "error");
    }

    if (currentSkills.includes(skill)) {
      return this.showNotification(
        "This skill is already in your list.",
        "error",
      );
    }

    this.appendSkill(skill);
    this.elements.skillInput.value = "";
    this.elements.skillInput.focus();
  }

  /**
   * Append a skill to the skills list
   */
  appendSkill(skill) {
    if (!this.elements.skillsList) return;

    const li = document.createElement("li");
    li.innerHTML = `${this.escapeHTML(skill)} <span class="delete-skill" title="Remove skill">${CONFIG.skillDeleteIcon}</span>`;
    this.elements.skillsList.appendChild(li);
  }

  /**
   * Handle deleting a skill
   */
  handleSkillDelete(event) {
    if (event.target.classList.contains("delete-skill")) {
      event.target.parentElement.remove();
    }
  }

  /**
   * Update the resume preview with form data
   */
  updateResumePreview(data) {
    if (!this.elements.previewContent) return;

    const headerHTML = this.generateResumeHeader(data);
    const sectionsHTML = this.generateResumeSections(data);

    this.elements.previewContent.innerHTML = `
      <div class="resume-header">
        ${headerHTML}
      </div>
      <div class="resume-body">
        ${sectionsHTML}
      </div>
    `;
  }

  generateResumeHeader(data) {
    return `
      <h1>${this.escapeHTML(data.name)}</h1>
      <p>${this.escapeHTML(data.email)}${data.phone ? ` | ${this.escapeHTML(data.phone)}` : ""}</p>
    `;
  }

  generateResumeSections(data) {
    const section = (title, content) => {
      if (!content) return "";
      return `
        <section>
          <h2>${title}</h2>
          ${content}
        </section>
      `;
    };

    const bio = section("Summary", `<p>${this.escapeHTML(data.bio)}</p>`);
    const skills = section("Skills", `<ul>${data.skills?.map((s) => `<li>${this.escapeHTML(s)}</li>`).join("")}</ul>`);
    const education = section("Education", `<p>${this.escapeHTML(data.education)}</p>`);
    
    // Generate experiences section
    let experienceHTML = "";
    if (data.experiences && Array.isArray(data.experiences) && data.experiences.length > 0) {
      experienceHTML = data.experiences.map(exp => {
        const dateRange = exp.startDate && exp.endDate 
          ? `${this.escapeHTML(exp.startDate)} - ${this.escapeHTML(exp.endDate)}`
          : exp.startDate 
          ? `${this.escapeHTML(exp.startDate)} - Present`
          : "";
        const location = exp.location ? ` | ${this.escapeHTML(exp.location)}` : "";
        return `
          <div class="experience-item">
            <h3>${this.escapeHTML(exp.position || "")} ${exp.company ? `at ${this.escapeHTML(exp.company)}` : ""}</h3>
            ${dateRange ? `<p class="experience-date">${dateRange}${location}</p>` : ""}
            ${exp.description ? `<p>${this.escapeHTML(exp.description)}</p>` : ""}
          </div>
        `;
      }).join("");
    } else if (data.experience) {
      // Fallback for old format
      experienceHTML = `<p>${this.escapeHTML(data.experience)}</p>`;
    }
    const experience = section("Experience", experienceHTML);

    return `${bio}${skills}${education}${experience}`;
  }

  /**
   * Save data to local storage
   */
  saveToLocalStorage(data) {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data to local storage:", error);
      this.showNotification("Failed to save data.", "error");
    }
  }

  /**
   * Load saved data from local storage
   */
  loadSavedData() {
    try {
      const savedData =
        JSON.parse(localStorage.getItem(CONFIG.storageKey)) || {};
      this.populateForm(savedData);
      this.updateResumePreview(savedData);
    } catch (error) {
      console.error("Failed to load saved data:", error);
      this.showNotification("Failed to load saved data.", "error");
    }
  }

  /**
   * Populate form with saved data
   */
  populateForm(data) {
    if (!this.elements.form) return;

    const allFields = [...CONFIG.requiredFields, ...CONFIG.optionalFields];
    allFields.forEach((field) => {
      const input = this.elements.form.querySelector(`[name="${field}"]`);
      if (input && data[field]) {
        input.value = data[field];
      }
    });

    if (data.skills && Array.isArray(data.skills)) {
      data.skills.forEach((skill) => this.appendSkill(skill));
    }

    if (data.experiences && Array.isArray(data.experiences)) {
      data.experiences.forEach((exp) => this.addExperienceEntry(exp));
    }
  }

  /**
   * Show a notification message
   */
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 300);
    }, CONFIG.notificationDuration);
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  escapeHTML(str) {
    if (!str || typeof str !== "string") return "";

    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Handle PDF download
   */
  handleDownloadPdf() {
    const element = this.elements.previewContent;
    const opt = {
      margin: 1,
      filename: "resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  }

  /**
   * Handle printing the resume
   */
  handlePrintResume() {
    window.print();
  }

  /**
   * Handle clearing the form
   */
  handleClearForm() {
    if (this.elements.form) {
      this.elements.form.reset();
    }

    if (this.elements.skillsList) {
      this.elements.skillsList.innerHTML = "";
    }

    const experiencesList = document.getElementById("experiences-list");
    if (experiencesList) {
      experiencesList.innerHTML = "";
      this.experiences = [];
      this.experienceCounter = 0;
    }

    localStorage.removeItem(CONFIG.storageKey);
    this.updateResumePreview({});
    this.showNotification("Form cleared successfully!", "success");
  }

  /**
   * Handle adding a new experience entry
   */
  handleAddExperience() {
    this.addExperienceEntry();
  }

  /**
   * Add an experience entry to the form
   */
  addExperienceEntry(data = {}) {
    const experiencesList = document.getElementById("experiences-list");
    if (!experiencesList) return;

    const id = this.experienceCounter++;
    const experienceId = `experience-${id}`;

    const experienceHTML = `
      <div class="experience-entry" data-id="${id}">
        <div class="experience-entry-header">
          <h4>Experience #${id + 1}</h4>
          <button type="button" class="delete-experience" aria-label="Remove Experience">×</button>
        </div>
        <div class="experience-fields">
          <div class="form-group">
            <label for="${experienceId}-company">Company *</label>
            <input type="text" id="${experienceId}-company" name="experience-company" 
                   placeholder="Company Name" value="${this.escapeHTML(data.company || "")}" required>
          </div>
          <div class="form-group">
            <label for="${experienceId}-position">Position/Title *</label>
            <input type="text" id="${experienceId}-position" name="experience-position" 
                   placeholder="Job Title" value="${this.escapeHTML(data.position || "")}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="${experienceId}-start">Start Date</label>
              <input type="month" id="${experienceId}-start" name="experience-start" 
                     value="${data.startDate || ""}">
            </div>
            <div class="form-group">
              <label for="${experienceId}-end">End Date</label>
              <input type="month" id="${experienceId}-end" name="experience-end" 
                     value="${data.endDate || ""}">
              <label class="checkbox-label">
                <input type="checkbox" id="${experienceId}-current" name="experience-current" 
                       ${data.current ? "checked" : ""}>
                Current Position
              </label>
            </div>
          </div>
          <div class="form-group">
            <label for="${experienceId}-location">Location</label>
            <input type="text" id="${experienceId}-location" name="experience-location" 
                   placeholder="City, Country" value="${this.escapeHTML(data.location || "")}">
          </div>
          <div class="form-group">
            <label for="${experienceId}-description">Description</label>
            <textarea id="${experienceId}-description" name="experience-description" 
                      placeholder="Describe your responsibilities and achievements..." 
                      rows="4">${this.escapeHTML(data.description || "")}</textarea>
          </div>
        </div>
      </div>
    `;

    experiencesList.insertAdjacentHTML("beforeend", experienceHTML);

    // Handle current position checkbox
    const currentCheckbox = document.getElementById(`${experienceId}-current`);
    const endDateInput = document.getElementById(`${experienceId}-end`);
    if (currentCheckbox && endDateInput) {
      currentCheckbox.addEventListener("change", (e) => {
        endDateInput.disabled = e.target.checked;
        if (e.target.checked) {
          endDateInput.value = "";
        }
      });
      if (currentCheckbox.checked) {
        endDateInput.disabled = true;
      }
    }
  }

  /**
   * Handle deleting an experience entry
   */
  handleExperienceDelete(event) {
    if (event.target.classList.contains("delete-experience")) {
      const experienceEntry = event.target.closest(".experience-entry");
      if (experienceEntry) {
        experienceEntry.remove();
        this.showNotification("Experience removed", "success");
      }
    }
  }

  /**
   * Get all experiences from the form
   */
  getExperiences() {
    const experiencesList = document.getElementById("experiences-list");
    if (!experiencesList) return [];

    const entries = experiencesList.querySelectorAll(".experience-entry");
    const experiences = [];

    entries.forEach((entry) => {
      const id = entry.dataset.id;
      const company = entry.querySelector(`#experience-${id}-company`)?.value.trim();
      const position = entry.querySelector(`#experience-${id}-position`)?.value.trim();
      const startDate = entry.querySelector(`#experience-${id}-start`)?.value;
      const endDate = entry.querySelector(`#experience-${id}-end`)?.value;
      const current = entry.querySelector(`#experience-${id}-current`)?.checked;
      const location = entry.querySelector(`#experience-${id}-location`)?.value.trim();
      const description = entry.querySelector(`#experience-${id}-description`)?.value.trim();

      if (company || position) {
        experiences.push({
          company,
          position,
          startDate,
          endDate: current ? null : endDate,
          current: current || false,
          location,
          description,
        });
      }
    });

    return experiences;
  }

  /**
   * Detect and display installed AI agent information
   */
  async detectAndDisplayAIAgent() {
    const aiAgentInfo = this.elements.aiAgentInfo;
    if (!aiAgentInfo) return;

    try {
      // Load AI agent information from JSON file
      const aiAgents = await this.loadAIAgentInfo();
      
      if (aiAgents.length === 0) {
        aiAgentInfo.innerHTML = `
          <div class="ai-agent-status">
            <h3>🤖 AI Agent Status</h3>
            <p class="no-agent">No AI agents detected on this system.</p>
            <p class="hint">Run <code>node detect-ai-agent.js</code> to detect installed AI agents.</p>
          </div>
        `;
        return;
      }

      const agentsHTML = aiAgents.map(agent => `
        <div class="ai-agent-item">
          <div class="agent-header">
            <span class="agent-name">${this.escapeHTML(agent.name)}</span>
            <span class="agent-version">v${this.escapeHTML(agent.version)}</span>
          </div>
          ${agent.type ? `<span class="agent-type badge badge-${agent.type}">${this.escapeHTML(agent.type)}</span>` : ''}
          ${agent.description ? `<p class="agent-description">${this.escapeHTML(agent.description)}</p>` : ''}
        </div>
      `).join('');

      aiAgentInfo.innerHTML = `
        <div class="ai-agent-status">
          <h3>🤖 AI Agent Status</h3>
          <div class="ai-agents-list">
            ${agentsHTML}
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Error detecting AI agents:", error);
      aiAgentInfo.innerHTML = `
        <div class="ai-agent-status">
          <h3>🤖 AI Agent Status</h3>
          <p class="error">Unable to load AI agent information.</p>
          <p class="hint">Run <code>node detect-ai-agent.js</code> to generate agent information.</p>
        </div>
      `;
    }
  }

  /**
   * Load AI agent information from JSON file
   */
  async loadAIAgentInfo() {
    try {
      const response = await fetch('ai-agents.json');
      if (!response.ok) {
        throw new Error('AI agents file not found');
      }
      const agents = await response.json();
      return Array.isArray(agents) ? agents : [];
    } catch (error) {
      console.warn('Could not load ai-agents.json:', error.message);
      // Check localStorage as fallback
      const cachedAgentInfo = localStorage.getItem('aiAgentInfo');
      if (cachedAgentInfo) {
        try {
          const parsed = JSON.parse(cachedAgentInfo);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          // Invalid cache
        }
      }
      return [];
    }
  }

  /**
   * Setup import handlers
   */
  setupImportHandlers() {
    const importButtons = document.querySelectorAll(".button-import");
    const modal = document.getElementById("import-modal");
    const closeModal = document.getElementById("close-modal");
    const fileUpload = document.getElementById("file-upload");
    const fileUploadInput = document.getElementById("file-upload-input");

    // Open modal for each import type
    importButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const source = button.dataset.source;
        this.openImportModal(source);
      });
    });

    // Close modal
    if (closeModal) {
      closeModal.addEventListener("click", () => this.closeImportModal());
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeImportModal();
        }
      });
    }

    // File upload handler
    if (fileUpload) {
      fileUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleFileUpload(file);
        }
      });
    }

    if (fileUploadInput) {
      fileUploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          document.getElementById("file-name").textContent = file.name;
          document.getElementById("parse-file").disabled = false;
        }
      });
    }

    // Parse handlers
    const parseLinkedIn = document.getElementById("parse-linkedin");
    const parseXing = document.getElementById("parse-xing");
    const parseIndeed = document.getElementById("parse-indeed");
    const parseText = document.getElementById("parse-text");
    const parseFile = document.getElementById("parse-file");

    if (parseLinkedIn) {
      parseLinkedIn.addEventListener("click", () => {
        const text = document.getElementById("linkedin-text")?.value;
        if (text) this.parseAndImport(text, "linkedin");
      });
    }

    if (parseXing) {
      parseXing.addEventListener("click", () => {
        const text = document.getElementById("xing-text")?.value;
        if (text) this.parseAndImport(text, "xing");
      });
    }

    if (parseIndeed) {
      parseIndeed.addEventListener("click", () => {
        const text = document.getElementById("indeed-text")?.value;
        if (text) this.parseAndImport(text, "indeed");
      });
    }

    if (parseText) {
      parseText.addEventListener("click", () => {
        const text = document.getElementById("text-import")?.value;
        if (text) this.parseAndImport(text, "text");
      });
    }

    if (parseFile) {
      parseFile.addEventListener("click", () => {
        this.showNotification("File parsing requires server-side processing. Please use the text paste option for now.", "info");
      });
    }
  }

  /**
   * Open import modal for specific source
   */
  openImportModal(source) {
    const modal = document.getElementById("import-modal");
    const modalTitle = document.getElementById("modal-title");
    if (!modal || !modalTitle) return;

    // Hide all forms
    document.querySelectorAll(".import-form").forEach((form) => {
      form.style.display = "none";
    });

    // Show relevant form
    const formId = `import-${source}-form`;
    const form = document.getElementById(formId);
    if (form) {
      form.style.display = "block";
    }

    // Update title
    const titles = {
      linkedin: "Import from LinkedIn",
      xing: "Import from Xing",
      indeed: "Import from Indeed",
      text: "Import from Text",
      file: "Upload Resume File",
    };
    modalTitle.textContent = titles[source] || "Import Resume";

    modal.classList.add("show");
    modal.style.display = "flex";
  }

  /**
   * Close import modal
   */
  closeImportModal() {
    const modal = document.getElementById("import-modal");
    if (modal) {
      modal.classList.remove("show");
      modal.style.display = "none";
      // Clear all textareas
      document.querySelectorAll(".import-textarea").forEach((ta) => {
        ta.value = "";
      });
    }
  }

  /**
   * Handle file upload
   */
  handleFileUpload(file) {
    this.showNotification(`File "${file.name}" selected. Note: Full parsing requires server-side processing.`, "info");
  }

  /**
   * Parse and import text from various sources
   */
  parseAndImport(text, source) {
    try {
      const parsedData = this.parseResumeText(text, source);
      this.populateFormFromImport(parsedData);
      this.closeImportModal();
      this.showNotification("Resume imported successfully! Please review and adjust the information.", "success");
    } catch (error) {
      console.error("Error parsing resume:", error);
      this.showNotification("Error parsing resume. Please check the format and try again.", "error");
    }
  }

  /**
   * Parse resume text (basic parsing - can be enhanced)
   */
  parseResumeText(text, source) {
    const data = {};

    // Extract name (usually first line or after "Name:")
    const nameMatch = text.match(/(?:Name|Full Name|FullName)[:\s]+([^\n]+)/i) ||
                     text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) data.name = nameMatch[1].trim();

    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) data.email = emailMatch[1];

    // Extract phone
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) data.phone = phoneMatch[0];

    // Extract bio/summary
    const bioMatch = text.match(/(?:Summary|About|Bio|Profile)[:\s]+([^\n]+(?:\n[^\n]+)*?)(?=\n[A-Z]|$)/i);
    if (bioMatch) data.bio = bioMatch[1].trim();

    // Extract skills
    const skillsMatch = text.match(/(?:Skills|Technical Skills|Competencies)[:\s]+([^\n]+(?:\n[^\n]+)*?)(?=\n[A-Z]|$)/i);
    if (skillsMatch) {
      const skillsText = skillsMatch[1];
      const skills = skillsText.split(/[,;•\n]/).map(s => s.trim()).filter(Boolean);
      data.skills = skills;
    }

    // Extract education
    const educationMatch = text.match(/(?:Education|Academic)[:\s]+([^\n]+(?:\n[^\n]+)*?)(?=\n(?:Experience|Work|Employment)|$)/i);
    if (educationMatch) data.education = educationMatch[1].trim();

    // Extract experiences (basic pattern matching)
    const experienceSection = text.match(/(?:Experience|Work Experience|Employment|Career)[:\s]+([\s\S]*?)(?=\n(?:Education|Skills|$)|$)/i);
    if (experienceSection) {
      const expText = experienceSection[1];
      // Try to parse multiple experiences
      const experiences = this.parseExperiences(expText);
      if (experiences.length > 0) {
        data.experiences = experiences;
      } else {
        data.experience = expText.trim();
      }
    }

    return data;
  }

  /**
   * Parse experiences from text
   */
  parseExperiences(text) {
    const experiences = [];
    // Split by common patterns (company names, dates, etc.)
    const lines = text.split(/\n/).filter(line => line.trim());
    
    let currentExp = null;
    lines.forEach((line) => {
      // Look for company/position patterns
      const companyMatch = line.match(/(.+?)\s+[-–—]\s*(.+?)\s*(\d{4}|\w+\s+\d{4})/);
      if (companyMatch) {
        if (currentExp) experiences.push(currentExp);
        currentExp = {
          company: companyMatch[1].trim(),
          position: companyMatch[2].trim(),
          description: "",
        };
      } else if (currentExp && line.trim()) {
        currentExp.description += (currentExp.description ? "\n" : "") + line.trim();
      }
    });
    if (currentExp) experiences.push(currentExp);

    return experiences;
  }

  /**
   * Populate form from imported data
   */
  populateFormFromImport(data) {
    // Populate basic fields
    if (data.name) {
      const nameInput = document.getElementById("name");
      if (nameInput) nameInput.value = data.name;
    }
    if (data.email) {
      const emailInput = document.getElementById("email");
      if (emailInput) emailInput.value = data.email;
    }
    if (data.phone) {
      const phoneInput = document.getElementById("phone");
      if (phoneInput) phoneInput.value = data.phone;
    }
    if (data.bio) {
      const bioInput = document.getElementById("bio");
      if (bioInput) bioInput.value = data.bio;
    }
    if (data.education) {
      const educationInput = document.getElementById("education");
      if (educationInput) educationInput.value = data.education;
    }

    // Populate skills
    if (data.skills && Array.isArray(data.skills)) {
      data.skills.forEach((skill) => this.appendSkill(skill));
    }

    // Populate experiences
    if (data.experiences && Array.isArray(data.experiences)) {
      data.experiences.forEach((exp) => this.addExperienceEntry(exp));
    }

    // Trigger form update
    const formData = this.collectFormData();
    this.updateResumePreview(formData);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => new ResumeBuilder());
