document.getElementById('resume-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const bio = document.getElementById('bio').value;
  const education = document.getElementById('education').value;
  const experience = document.getElementById('experience').value;
  const skills = Array.from(document.querySelectorAll('#skills-list li')).map(item => item.textContent);

  // Update the live preview
  const preview = document.getElementById('resume-preview');
  preview.innerHTML = `
    <h1>${name}</h1>
    <p>${email}</p>
    <p>${phone}</p>
    <p>${bio}</p>
    <h2>Skills</h2>
    <ul>${skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
    <h2>Education</h2>
    <p>${education}</p>
    <h2>Experience</h2>
    <p>${experience}</p>
  `;

  // Optionally, save to local storage
  localStorage.setItem('resumeData', JSON.stringify({name, email, phone, bio, education, experience, skills}));
});

function addSkill() {
  const skillInput = document.getElementById('skill');
  const skill = skillInput.value.trim();
  if (skill) {
    const newListElement = document.createElement('li');
    newListElement.textContent = skill;
    document.getElementById('skills-list').appendChild(newListElement);
    skillInput.value = ''; // Clear input after adding
  }
}
