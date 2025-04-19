console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");
// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
//   );
// currentLink?.classList.add('current');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/praveendesharma', title: 'GitHub' }
];

// Step 2: Create the <nav> element and add it to the top of the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// Step 3: Determine the base path depending on whether we’re local or on GitHub Pages
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/"                  // Local server
    : "/portfolio/";         // Replace 'website' with your GitHub repo name

// Step 4: Loop through the pages and add links to the <nav>
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // If it's a relative URL, prepend the base path
    url = !url.startsWith('http') ? BASE_PATH + url : url;

    // Add the link to the <nav>
    nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}