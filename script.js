// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the form element by its ID and attach the submit event listener
    const form = document.getElementById('resume-form');
    form.addEventListener('submit', handleFormSubmit);

    // Attach a click event listener to the 'Add Skill' button
    document.getElementById('add-skill-button').addEventListener('click', addSkill);
});

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const formData = collectFormData(); // Collect form data
    updateResumePreview(formData); // Update the resume preview with collected data
    saveToLocalStorage('resumeData', formData); // Save the data to local storage
}

// Collect data from the form inputs
function collectFormData() {
    return {
        name: getValueById('name'),
        email: getValueById('email'),
        phone: getValueById('phone'),
        bio: getValueById('bio'),
        education: getValueById('education'),
        experience: getValueById('experience'),
        skills: getSkills()
    };
}

// Get the value of a form input by its ID
function getValueById(id) {
    const element = document.getElementById(id);
    return element ? element.value : ''; // Return the element's value or an empty string if not found
}

// Get a list of skills from the skills list element
function getSkills() {
    const items = document.querySelectorAll('#skills-list li');
    return Array.from(items, item => item.textContent); // Convert NodeList to Array and get text content of each item
}

// Update the resume preview with the provided form data
function updateResumePreview(formData) {
    const preview = document.getElementById('resume-preview');
    preview.innerHTML = generatePreviewHTML(formData); // Generate and set the preview HTML
}

// Generate HTML for the resume preview
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

// Save data to local storage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data)); // Convert data to JSON string and save it
}

// Handle adding a new skill to the skills list
function addSkill() {
    const skillInput = document.getElementById('skill');
    const skill = skillInput.value.trim(); // Get and trim the skill input value

    if (skill) {
        appendToList('skills-list', skill); // Append the skill to the list
        skillInput.value = ''; // Clear the input field
    } else {
        alert('Please enter a skill to add.'); // Alert if the input field is empty
    }
}

// Append a new item to a list by its ID
function appendToList(listId, value) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li'); // Create a new list item
    listItem.textContent = value; // Set the list item's text content
    list.appendChild(listItem); // Append the list item to the list
}
