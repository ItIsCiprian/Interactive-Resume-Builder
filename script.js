/**
 * Sets up the form submission handler for the resume form.
 * Prevents default submission, gathers form data, updates the preview,
 * and optionally saves the data to local storage.
 */
document.getElementById('resume-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Stops the form from submitting normally.

    // Gather input values from the form.
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value,
        education: document.getElementById('education').value,
        experience: document.getElementById('experience').value,
        skills: Array.from(document.querySelectorAll('#skills-list li')).map(item => item.textContent)
    };

    // Update the resume preview with the gathered data.
    updateResumePreview(formData);

    // Save the form data to local storage for persistence.
    localStorage.setItem('resumeData', JSON.stringify(formData));
});

/**
 * Updates the content of the resume preview area.
 * @param {Object} formData - Contains all the resume data collected from the form.
 */
function updateResumePreview(formData) {
    const preview = document.getElementById('resume-preview');
    preview.innerHTML = `
        <h1>${formData.name}</h1>
        <p>${formData.email}</p>
        <p>${formData.phone}</p>
        <p>${formData.bio}</p>
        <h2>Skills</h2>
        <ul>${formData.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
        <h2>Education</h2>
        <p>${formData.education}</p>
        <h2>Experience</h2>
        <p>${formData.experience}</p>
    `;
}

/**
 * Adds a new skill to the skills list in the form and updates the skills preview.
 * Clears the input field after the skill is added.
 */
function addSkill() {
    const skillInput = document.getElementById('skill');
    const skill = skillInput.value.trim();
    if (skill) {
        const newListElement = document.createElement('li');
        newListElement.textContent = skill;
        document.getElementById('skills-list').appendChild(newListElement);
        skillInput.value = ''; // Clear the input field after adding the skill.
    }
}
