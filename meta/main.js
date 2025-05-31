import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let xScale, yScale;
let commitProgress = 100;

const data = await loadData();
const commits = processCommits(data);
let filteredCommits = commits;

const timeScale = d3.scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, 100]);

let commitMaxTime = timeScale.invert(commitProgress);

renderCommitInfo(data, filteredCommits);
renderScatterPlot(data, filteredCommits);
updateFileDisplay(filteredCommits);
// onTimeSliderChange();

// document.getElementById('commit-progress').addEventListener('input', onTimeSliderChange);

async function loadData() {
  return await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
}

function processCommits(data) {
  return d3.groups(data, d => d.commit).map(([commit, lines]) => {
    const { author, date, time, timezone, datetime } = lines[0];
    const entry = {
      id: commit,
      url: 'https://github.com/praveendesharma/portfolio/commit/' + commit,
      author, date, time, timezone, datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };
    Object.defineProperty(entry, 'lines', {
      value: lines, enumerable: false, writable: false, configurable: false
    });
    return entry;
  });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
  dl.append('dt').text('Number of files');
  dl.append('dd').text(new Set(data.map(d => d.file)).size);
  dl.append('dt').text('Average File Length (lines)');
  dl.append('dd').text(d3.mean(d3.groups(data, d => d.file).map(([, lines]) => lines.length)).toFixed(2));
  const max = d3.max(d3.groups(data, d => d.file).map(([, lines]) => lines.length));
  const maxFile = d3.groups(data, d => d.file).find(([, lines]) => lines.length === max)[0];
  dl.append('dt').text('Longest File (lines)');
  dl.append('dd').text(`${maxFile} (${max})`);
}

function renderScatterPlot(data, commits) {
  const width = 1000, height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top, right: width - margin.right,
    bottom: height - margin.bottom, left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart').append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3.scaleTime().domain(d3.extent(commits, d => d.datetime)).range([usableArea.left, usableArea.right]).nice();
  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);

  svg.append('g').attr('transform', `translate(0, ${usableArea.bottom})`).attr('class', 'x-axis').call(d3.axisBottom(xScale));
  svg.append('g').attr('transform', `translate(${usableArea.left}, 0)`).attr('class', 'y-axis').call(d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`));
  svg.append('g').attr('class', 'gridlines').attr('transform', `translate(${usableArea.left}, 0)`).call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
  svg.append('g').attr('class', 'dots');

  updateScatterPlot(data, commits);
}

function updateScatterPlot(data, commits) {
  const svg = d3.select('#chart').select('svg');
  xScale.domain(d3.extent(commits, d => d.datetime));

  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 25]);

  const xAxis = d3.axisBottom(xScale);
  svg.select('g.x-axis').transition().duration(500).call(xAxis);

  const dots = svg.select('g.dots');
  const sortedCommits = d3.sort(commits, d => -d.totalLines);

  const update = dots.selectAll('circle')
    .data(sortedCommits, d => d.id);

  update
    .join(
      enter => enter.append('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', 0)
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
          d3.select(event.currentTarget).style('fill-opacity', 1);
          renderTooltipContent(commit);
          updateTooltipVisibility(true);
          updateTooltipPosition(event);
        })
        .on('mouseleave', (event) => {
          d3.select(event.currentTarget).style('fill-opacity', 0.7);
          updateTooltipVisibility(false);
        })
        .transition()
        .duration(500)
        .attr('r', d => rScale(d.totalLines)),

      update => update
        .transition()
        .duration(500)
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines)),

      exit => exit
        .transition()
        .duration(300)
        .attr('r', 0)
        .remove()
    );
}

function onTimeSliderChange() {
  commitProgress = +document.getElementById('commit-progress').value;
  commitMaxTime = timeScale.invert(commitProgress);
  document.getElementById('commit-time').textContent = commitMaxTime.toLocaleString('en', {
    dateStyle: 'long', timeStyle: 'short'
  });
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  updateScatterPlot(data, filteredCommits);
  updateFileDisplay(filteredCommits);
}

function updateFileDisplay(filteredCommits) {
  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  const lines = filteredCommits.flatMap(d => d.lines);
  const files = d3.groups(lines, d => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  const filesContainer = d3.select('#files')
    .selectAll('div')
    .data(files, d => d.name)
    .join(
      enter => enter.append('div').call(div => {
        div.append('dt').append('code');
        div.append('dd');
      })
    );

  filesContainer.select('dt > code').html(d => `${d.name}<br><small>${d.lines.length} lines</small>`);

  filesContainer.select('dd')
    .selectAll('div')
    .data(d => d.lines)
    .join('div')
    .attr('class', 'loc')
    .style('background-color', d => colors(d.type));
}

function renderTooltipContent(commit) {
  document.getElementById('commit-link').href = commit.url;
  document.getElementById('commit-link').textContent = commit.id;
  document.getElementById('commit-date').textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  document.getElementById('commit-lines').textContent = commit.totalLines;
  document.getElementById('commit-author').textContent = commit.author;
  document.getElementById('commit-time').textContent = commit.time;
}

function updateTooltipVisibility(isVisible) {
  document.getElementById('commit-tooltip').hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';

// Commit narrative text
d3.select('#scatter-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html((d, i) => `
    <p>On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })}, I made <a href="${d.url}" target="_blank">
    ${i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}</a>.
    I edited ${d.totalLines} lines across ${
      d3.rollups(d.lines, D => D.length, d => d.file).length
    } files. Then I looked over all I had made, and I saw that it was very good.</p>
  `);

// Setup Scrollama
function onStepEnter(response) {
  const commit = response.element.__data__;
  filteredCommits = commits.filter(d => d.datetime <= commit.datetime);
  updateScatterPlot(data, filteredCommits);
  updateFileDisplay(filteredCommits);
}

const scroller = scrollama();
scroller
  .setup({
    container: '#scrolly-1',
    step: '#scatter-story .step',
    offset: 0.5,
  })
  .onStepEnter(onStepEnter);

