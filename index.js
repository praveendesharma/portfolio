import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

console.log('index.js is loaded');

// Fetch all projects from JSON and show the latest 3
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');

if (latestProjects && latestProjects.length > 0) {
  renderProjects(latestProjects, projectsContainer, 'h2');
} else {
  projectsContainer.innerHTML = '<p>No recent projects to show.</p>';
}

// Fetch GitHub data for your profile
const githubData = await fetchGitHubData('praveendesharma'); // Replace with your GitHub username
console.log('GitHub Data:', githubData);

// Select the container where GitHub stats will be shown
const profileStats = document.querySelector('#profile-stats');

// Update the HTML dynamically with GitHub stats
if (profileStats && githubData) {
  profileStats.innerHTML = `
    <h2>GitHub Stats</h2>
    <dl>
      <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
      <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
      <dt>Followers:</dt><dd>${githubData.followers}</dd>
      <dt>Following:</dt><dd>${githubData.following}</dd>
    </dl>
  `;
}
