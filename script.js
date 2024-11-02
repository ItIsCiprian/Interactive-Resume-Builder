storageKey: 'resumeData',
    selectors: {
        form: '#resume-form',
        preview: '#resume-preview',
        skillInput: '#skill',
        skillsList: '#skills-list',
        addSkillButton: '#add-skill-button'
    },
    required: ['name', 'email']
};

class ResumeBuilder {
    constructor() {
        this.form = document.querySelector(CONFIG.selectors.form);
        this.preview = document.querySelector(CONFIG.selectors.preview);
        this.skillInput = document.querySelector(CONFIG.selectors.skillInput);
        this.skillsList = document.querySelector(CONFIG.selectors.skillsList);
        this.addSkillButton = document.querySelector(CONFIG.selectors.addSkillButton);
        
        this.initializeEventListeners();
        this.loadSavedData();
    }

    initializeEventListeners() {
        this.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.addSkillButton?.addEventListener('click', this.handleAddSkill.bind(this));
        this.skillsList?.addEventListener('click', this.handleSkillDelete.bind(this));
    }

    async handleFormSubmit(event) {
        try {
            event.preventDefault();
            
            const formData = this.collectFormData();
            if (!this.validateFormData(formData)) {
                throw new Error('Please fill in all required fields.');
            }

            await this.saveToLocalStorage(formData);
            this.updateResumePreview(formData);
            this.showNotification('Resume updated successfully!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    validateFormData(data) {
        return CONFIG.required.every(field => data[field]?.trim());
    }

    collectFormData() {
        const formData = new FormData(this.form);
        return {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            bio: formData.get('bio'),
            education: formData.get('education'),
            experience: formData.get('experience'),
            skills: this.getSkills()
        };
    }

    getSkills() {
        return Array.from(this.skillsList?.children || [])
            .map(item => item.textContent?.replace('×', '').trim())
            .filter(Boolean);
    }

    handleAddSkill() {
        const skill = this.skillInput?.value.trim();
        
        if (!skill) {
            this.showNotification('Please enter a skill to add.', 'error');
            return;
        }

        if (this.getSkills().includes(skill)) {
            this.showNotification('This skill already exists!', 'error');
            return;
        }

        this.appendSkill(skill);
        this.skillInput.value = '';
        this.skillInput.focus();
    }

    appendSkill(skill) {
        const li = document.createElement('li');
        li.innerHTML = `
            ${skill}
            <span class="delete-skill" title="Remove skill">×</span>
        `;
        this.skillsList?.appendChild(li);
    }

    handleSkillDelete(event) {
        if (event.target.classList.contains('delete-skill')) {
            event.target.parentElement.remove();
        }
    }

    updateResumePreview(data) {
        if (!this.preview) return;
        
        this.preview.innerHTML = `
            <div class="resume-header">
                <h1>${this.escapeHTML(data.name)}</h1>
                <div class="contact-info">
                    <p><strong>Email:</strong> ${this.escapeHTML(data.email)}</p>
                    ${data.phone ? `<p><strong>Phone:</strong> ${this.escapeHTML(data.phone)}</p>` : ''}
                </div>
            </div>

            ${data.bio ? `
                <section class="bio-section">
                    <h2>Professional Summary</h2>
                    <p>${this.escapeHTML(data.bio)}</p>
                </section>
            ` : ''}

            ${data.skills.length ? `
                <section class="skills-section">
                    <h2>Skills</h2>
                    <ul class="skills-list">
                        ${data.skills.map(skill => `<li>${this.escapeHTML(skill)}</li>`).join('')}
                    </ul>
                </section>
            ` : ''}

            ${data.education ? `
                <section class="education-section">
                    <h2>Education</h2>
                    <p>${this.escapeHTML(data.education)}</p>
                </section>
            ` : ''}

            ${data.experience ? `
                <section class="experience-section">
                    <h2>Experience</h2>
                    <p>${this.escapeHTML(data.experience)}</p>
                </section>
            ` : ''}
        `;
    }

    async saveToLocalStorage(data) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        } catch (error) {
            throw new Error('Failed to save resume data. Please try again.');
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem(CONFIG.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.populateForm(data);
                this.updateResumePreview(data);
            }
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

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ResumeBuilder();
});

// Recommended CSS styles for notifications
const styles = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px;
    border-radius: 4px;
    color: white;
    animation: slide-in 0.3s ease-out;
}

.notification.success {
    background-color: #4CAF50;
}

.notification.error {
    background-color: #f44336;
}

.notification.info {
    background-color: #2196F3;
}

@keyframes slide-in {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.delete-skill {
    cursor: pointer;
    margin-left: 8px;
    color: #f44336;
}

.delete-skill:hover {
    color: #d32f2f;
}
`;
