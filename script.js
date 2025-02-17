const CONFIG = {
    storageKey: 'resumeData',
    selectors: {
        form: '#resume-form',
        preview: '#resume-preview',
        skillInput: '#skill',
        skillsList: '#skills-list',
        addSkillButton: '#add-skill-button'
    },
    requiredFields: ['name', 'email']
};

class ResumeBuilder {
    constructor() {
        this.cacheDOM();
        this.bindEvents();
        this.loadSavedData();
    }

    cacheDOM() {
        const { form, preview, skillInput, skillsList, addSkillButton } = CONFIG.selectors;
        this.form = document.querySelector(form);
        this.preview = document.querySelector(preview);
        this.skillInput = document.querySelector(skillInput);
        this.skillsList = document.querySelector(skillsList);
        this.addSkillButton = document.querySelector(addSkillButton);
    }

    bindEvents() {
        this.form?.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.addSkillButton?.addEventListener('click', () => this.handleAddSkill());
        this.skillsList?.addEventListener('click', (e) => this.handleSkillDelete(e));
    }

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

    validateFormData(data) {
        return CONFIG.requiredFields.every(field => data[field]?.trim());
    }

    collectFormData() {
        const data = {};
        CONFIG.requiredFields.concat(['phone', 'bio', 'education', 'experience']).forEach(field => {
            const input = this.form?.querySelector(`[name="${field}"]`);
            data[field] = input ? input.value.trim() : '';
        });
        data.skills = this.getSkills();
        return data;
    }

    getSkills() {
        return [...this.skillsList?.children].map(item => item.textContent.replace('×', '').trim()).filter(Boolean);
    }

    handleAddSkill() {
        const skill = this.skillInput?.value.trim();
        if (!skill || this.getSkills().includes(skill)) {
            return this.showNotification('Invalid or duplicate skill!', 'error');
        }
        this.appendSkill(skill);
        this.skillInput.value = '';
    }

    appendSkill(skill) {
        const li = document.createElement('li');
        li.innerHTML = `${skill} <span class="delete-skill" title="Remove skill">×</span>`;
        this.skillsList?.appendChild(li);
    }

    handleSkillDelete(event) {
        if (event.target.classList.contains('delete-skill')) {
            event.target.parentElement.remove();
        }
    }

    updateResumePreview(data) {
        if (!this.preview) return;
        
        const sections = {
            bio: `<section><h2>Summary</h2><p>${this.escapeHTML(data.bio)}</p></section>`,
            skills: `<section><h2>Skills</h2><ul>${data.skills.map(skill => `<li>${this.escapeHTML(skill)}</li>`).join('')}</ul></section>`,
            education: `<section><h2>Education</h2><p>${this.escapeHTML(data.education)}</p></section>`,
            experience: `<section><h2>Experience</h2><p>${this.escapeHTML(data.experience)}</p></section>`
        };

        this.preview.innerHTML = `
            <div class="resume-header">
                <h1>${this.escapeHTML(data.name)}</h1>
                <p><strong>Email:</strong> ${this.escapeHTML(data.email)}</p>
                ${data.phone ? `<p><strong>Phone:</strong> ${this.escapeHTML(data.phone)}</p>` : ''}
            </div>
            ${Object.values(sections).filter(Boolean).join('')}
        `;
    }

    saveToLocalStorage(data) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        } catch (error) {
            this.showNotification('Failed to save data.', 'error');
        }
    }

    loadSavedData() {
        try {
            const savedData = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || {};
            this.populateForm(savedData);
            this.updateResumePreview(savedData);
        } catch (error) {
            this.showNotification('Failed to load saved data.', 'error');
        }
    }

    populateForm(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'skills') {
                value.forEach(skill => this.appendSkill(skill));
            } else {
                const input = this.form?.querySelector(`[name="${key}"]`);
                if (input) input.value = value;
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => new ResumeBuilder());
