import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

console.log('projects.js is loaded');

// === Global state ===
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const piePlot = document.querySelector('#projects-pie-plot');
const legend = document.querySelector('.legend');
const searchInput = document.querySelector('.searchBar');
let query = '';
let selectedIndex = -1;

// === Initial render ===
if (projects && projects.length > 0) {
  renderProjects(projects, projectsContainer, 'h2');
  renderPieChart(projects);
  if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
  }
} else {
  projectsContainer.innerHTML = '<p>No projects available at the moment.</p>';
}

// === Search bar filtering ===
searchInput?.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  selectedIndex = -1; // reset pie filter on new search
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
  if (projectsTitle) {
    projectsTitle.textContent = `${filteredProjects.length} Projects`;
  }
});

// === Main function to draw pie chart and handle filtering ===
function renderPieChart(projectsGiven) {
  if (!piePlot || !legend) return;

  // Clear old chart
  d3.select('#projects-pie-plot').selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  // Group data by year
  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-pie-plot');

  // Draw wedges with click-to-filter
  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
      
        svg.selectAll('path')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      
        legendList.selectAll('li')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      
        // Apply BOTH filters: search + year (if selected)
        let filtered = projects.filter((project) => {
          let matchQuery = Object.values(project).join('\n').toLowerCase().includes(query);
          let matchYear = selectedIndex === -1 || project.year === data[selectedIndex].label;
          return matchQuery && matchYear;
        });
      
        renderProjects(filtered, projectsContainer, 'h2');
      
        if (projectsTitle) {
          if (selectedIndex === -1) {
            projectsTitle.textContent = `${filtered.length} Matching Projects`;
          } else {
            const yr = data[selectedIndex].label;
            projectsTitle.textContent = `${filtered.length} Projects in ${yr} matching "${query}"`;
          }
        }
      });
  });

  // Draw legend
  const legendList = d3.select('.legend');
  data.forEach((d, i) => {
    legendList
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', i === selectedIndex ? 'selected' : '')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
      
        svg.selectAll('path')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      
        legendList.selectAll('li')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      
        // Apply BOTH filters: search + year (if selected)
        let filtered = projects.filter((project) => {
          let matchQuery = Object.values(project).join('\n').toLowerCase().includes(query);
          let matchYear = selectedIndex === -1 || project.year === data[selectedIndex].label;
          return matchQuery && matchYear;
        });
      
        renderProjects(filtered, projectsContainer, 'h2');
      
        if (projectsTitle) {
          if (selectedIndex === -1) {
            projectsTitle.textContent = `${filtered.length} Matching Projects`;
          } else {
            const yr = data[selectedIndex].label;
            projectsTitle.textContent = `${filtered.length} Projects in ${yr} matching "${query}"`;
          }
        }
      });
  });
}
