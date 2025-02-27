/**
 * Resume Builder Application
 * A client-side application for creating and previewing resumes
 */

// Configuration object with constants
const CONFIG = {
  storageKey: 'resumeData',
  selectors: {
    form: '#resume-form',
    preview: '#resume-preview',
    skillInput: '#skill',
    skillsList: '#skills-list',
    addSkillButton: '#add-skill-button'
  },
  requiredFields: ['name', 'email'],
  optionalFields: ['phone', 'bio', 'education', 'experience'],
  notificationDuration: 3000
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
      console.error('Required DOM elements not found');
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
    
    Object.entries(selectors).forEach(([key, selector]) => {
      this.elements[key] = document.querySelector(selector);
    });
  }

  /**
   * Validate that required elements exist in the DOM
   */
  validateElementsExist() {
    return this.elements.form && this.elements.preview;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Form submission
    this.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Skills management
    if (this.elements.addSkillButton) {
      this.elements.addSkillButton.addEventListener('click', this.handleAddSkill.bind(this));
    }
    
    if (this.elements.skillsList) {
      this.elements.skillsList.addEventListener('click', this.handleSkillDelete.bind(this));
    }
  }

  /**
   * Handle form submission
   */
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = this.collectFormData();
    
    if (!this.validateFormData(formData)) {
      return this.showNotification('Please fill in all required fields.', 'error');
    }
    
    this.saveToLocalStorage(formData);
    this.updateResumePreview(formData);
    this.showNotification('Resume updated successfully!', 'success');
  }

  /**
   * Collect form data from inputs
   */
  collectFormData() {
    const data = {};
    const allFields = [...CONFIG.requiredFields, ...CONFIG.optionalFields];
    
    allFields.forEach(field => {
      const input = this.elements.form.querySelector(`[name="${field}"]`);
      data[field] = input ? input.value.trim() : '';
    });
    
    data.skills = this.getSkills();
    return data;
  }

  /**
   * Validate that all required fields have values
   */
  validateFormData(data) {
    return CONFIG.requiredFields.every(field => data[field]?.trim());
  }

  /**
   * Get current skills from the skills list
   */
  getSkills() {
    if (!this.elements.skillsList) return [];
    
    return Array.from(this.elements.skillsList.children)
      .map(item => item.textContent.replace('×', '').trim())
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
      return this.showNotification('Please enter a skill.', 'error');
    }
    
    if (currentSkills.includes(skill)) {
      return this.showNotification('This skill is already in your list.', 'error');
    }
    
    this.appendSkill(skill);
    this.elements.skillInput.value = '';
    this.elements.skillInput.focus();
  }

  /**
   * Append a skill to the skills list
   */
  appendSkill(skill) {
    if (!this.elements.skillsList) return;
    
    const li = document.createElement('li');
    li.innerHTML = `${this.escapeHTML(skill)} <span class="delete-skill" title="Remove skill">×</span>`;
    this.elements.skillsList.appendChild(li);
  }

  /**
   * Handle deleting a skill
   */
  handleSkillDelete(event) {
    if (event.target.classList.contains('delete-skill')) {
      event.target.parentElement.remove();
    }
  }

  /**
   * Update the resume preview with form data
   */
  updateResumePreview(data) {
    if (!this.elements.preview) return;
    
    const sections = this.generateResumeSections(data);
    const header = this.generateResumeHeader(data);
    
    this.elements.preview.innerHTML = `
      <div class="resume-header">
        ${header}
      </div>
      ${sections.join('')}
    `;
  }

  /**
   * Generate the resume header HTML
   */
  generateResumeHeader(data) {
    let header = `<h1>${this.escapeHTML(data.name)}</h1>
                 <p><strong>Email:</strong> ${this.escapeHTML(data.email)}</p>`;
    
    if (data.phone) {
      header += `<p><strong>Phone:</strong> ${this.escapeHTML(data.phone)}</p>`;
    }
    
    return header;
  }

  /**
   * Generate resume sections HTML
   */
  generateResumeSections(data) {
    const sections = [];
    
    // Bio section
    if (data.bio) {
      sections.push(`
        <section>
          <h2>Summary</h2>
          <p>${this.escapeHTML(data.bio)}</p>
        </section>
      `);
    }
    
    // Skills section
    if (data.skills && data.skills.length > 0) {
      const skillsItems = data.skills
        .map(skill => `<li>${this.escapeHTML(skill)}</li>`)
        .join('');
      
      sections.push(`
        <section>
          <h2>Skills</h2>
          <ul>${skillsItems}</ul>
        </section>
      `);
    }
    
    // Education section
    if (data.education) {
      sections.push(`
        <section>
          <h2>Education</h2>
          <p>${this.escapeHTML(data.education)}</p>
        </section>
      `);
    }
    
    // Experience section
    if (data.experience) {
      sections.push(`
        <section>
          <h2>Experience</h2>
          <p>${this.escapeHTML(data.experience)}</p>
        </section>
      `);
    }
    
    return sections;
  }

  /**
   * Save data to local storage
   */
  saveToLocalStorage(data) {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to local storage:', error);
      this.showNotification('Failed to save data.', 'error');
    }
  }

  /**
   * Load saved data from local storage
   */
  loadSavedData() {
    try {
      const savedData = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || {};
      this.populateForm(savedData);
      this.updateResumePreview(savedData);
    } catch (error) {
      console.error('Failed to load saved data:', error);
      this.showNotification('Failed to load saved data.', 'error');
    }
  }

  /**
   * Populate form with saved data
   */
  populateForm(data) {
    if (!this.elements.form) return;
    
    // Populate text fields
    const allFields = [...CONFIG.requiredFields, ...CONFIG.optionalFields];
    allFields.forEach(field => {
      const input = this.elements.form.querySelector(`[name="${field}"]`);
      if (input && data[field]) {
        input.value = data[field];
      }
    });
    
    // Populate skills
    if (data.skills && Array.isArray(data.skills)) {
      data.skills.forEach(skill => this.appendSkill(skill));
    }
  }

  /**
   * Show a notification message
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, CONFIG.notificationDuration);
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => new ResumeBuilder());
