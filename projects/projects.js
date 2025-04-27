import { fetchJSON, renderProjects } from '../global.js';

console.log('projects.js is loaded'); // Debug check

// Fetch project data
const projects = await fetchJSON('../lib/projects.json');
console.log('Fetched projects:', projects); // Check data

// Select the container where projects will go
const projectsContainer = document.querySelector('.projects');
console.log('Found container:', projectsContainer); // Debug check

// Render the projects into the container
if (projects && projects.length > 0) {
    renderProjects(projects, projectsContainer, 'h2');
} else {
    projectsContainer.innerHTML = '<p>No projects available at the moment.</p>';
}

// Count projects and update the title
const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  const count = projects ? projects.length : 0;
  projectsTitle.textContent = `${count} Projects`;
}