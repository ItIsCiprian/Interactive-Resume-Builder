document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resume-form');
    form.addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = collectFormData();
    updateResumePreview(formData);
    saveToLocalStorage('resumeData', formData);
}

function collectFormData() {
    return {
        name: getValue('name'),
        email: getValue('email'),
        phone: getValue('phone'),
        bio: getValue('bio'),
        education: getValue('education'),
        experience: getValue('experience'),
        skills: getSkills()
    };
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function getSkills() {
    const items = document.querySelectorAll('#skills-list li');
    return Array.from(items, item => item.textContent);
}

function updateResumePreview(formData) {
    const preview = document.getElementById('resume-preview');
    preview.innerHTML = generatePreviewHTML(formData);
}

function generatePreviewHTML(data) {
    return `
        <h1>${data.name}</h1>
        <p>${data.email}</p>
        <p>${data.phone}</p>
        <p>${data.bio}</p>
        <h2>Skills</h2>
        <ul>${data.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
        <h2>Education</h2>
        <p>${data.education}</p>
        <h2>Experience</h2>
        <p>${data.experience}</p>
    `;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

document.getElementById('add-skill-button').addEventListener('click', addSkill);

function addSkill() {
    const skillInput = document.getElementById('skill');
    if (skillInput.value.trim()) {
        appendToList('skills-list', skillInput.value.trim());
        skillInput.value = '';
    } else {
        alert('Please enter a skill to add.');
    }
}

function appendToList(listId, value) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');
    listItem.textContent = value;
    list.appendChild(listItem);
}
