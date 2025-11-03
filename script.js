/**
 * Resume Builder Application
 * A client-side application for creating and previewing resumes
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
  },
  requiredFields: ["name", "email"],
  optionalFields: ["phone", "bio", "education", "experience"],
  notificationDuration: 3000,
  skillDeleteIcon: "×", // Centralized delete icon
};

class ResumeBuilder {
  constructor() {
    this.elements = {};
    this.skills = [];

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
    const experience = section("Experience", `<p>${this.escapeHTML(data.experience)}</p>`);

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

    localStorage.removeItem(CONFIG.storageKey);
    this.updateResumePreview({});
    this.showNotification("Form cleared successfully!", "success");
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => new ResumeBuilder());
