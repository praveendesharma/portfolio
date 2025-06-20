"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const codeLines = [
    'const developer = {',
    '  name: "Praveen Sharma",',
    '  major(s): "Data Science, Applied Math",',
    '  university: "UC San Diego",',
    '  favorites: {',
    '    coffee: "americano",',
    '    sport: "formula one",',
    '  }'
  ];
  const copilotSuggestion = '// Copilot: Let me help you complete this...';
  const copilotFinal = '// Copilot: Looks good!';
  const codeBlock = document.getElementById('code-script');
  const runButton = document.getElementById('run-button');
  const aboutContent = document.getElementById('about-content');
  let currentChar = 0;
  let currentLine = 1;

  // Start with just the first line as ghost
  codeBlock.innerHTML = '<span class="ghost">' + codeLines[0] + '</span>';

  // Type the first line character by character
  function typeFirstLine() {
    if (currentChar <= codeLines[0].length) {
      codeBlock.innerHTML = 
        '<span class="typed">' + codeLines[0].slice(0, currentChar) + '</span>' +
        '<span class="ghost">' + codeLines[0].slice(currentChar) + '</span>';
      
      currentChar++;
      setTimeout(typeFirstLine, 50);
    } else {
      // After first line is typed, show Copilot and remaining lines
      setTimeout(showCopilotAndRest, 400);
    }
  }

  // Show Copilot suggestion and remaining lines as ghost
  function showCopilotAndRest() {
    const remainingLines = codeLines.slice(1).join('\n');
    codeBlock.innerHTML = 
      '<span class="ghost copilot-line">' + copilotSuggestion + '</span>\n' +
      '<span class="typed">' + codeLines[0] + '</span>\n' +
      '<span class="ghost">' + remainingLines + '</span>';
    
    // Start typing remaining lines
    setTimeout(typeRemainingLines, 800);
  }

  // Type remaining lines one by one
  function typeRemainingLines() {
    if (currentLine < codeLines.length) {
      const acceptedLines = codeLines.slice(0, currentLine + 1).join('\n');
      const remainingLines = codeLines.slice(currentLine + 1).join('\n');
      
      codeBlock.innerHTML = 
        '<span class="ghost copilot-line">' + copilotSuggestion + '</span>\n' +
        '<span class="typed">' + acceptedLines + '</span>' +
        (remainingLines ? '\n<span class="ghost">' + remainingLines + '</span>' : '');

      currentLine++;
      setTimeout(typeRemainingLines, 100);
    } else {
      // After all lines are typed, accept the Copilot suggestion
      setTimeout(() => {
        const ghostSuggestion = document.querySelector('.ghost.copilot-line');
        if (ghostSuggestion) {
          ghostSuggestion.classList.remove('ghost');
          ghostSuggestion.classList.add('typed');
        }
        // After a short delay, change the Copilot text to 'Copilot: Looks good!'
        setTimeout(() => {
          const copilotLine = document.querySelector('.copilot-line');
          if (copilotLine) {
            copilotLine.textContent = copilotFinal;
          }
        }, 800);
      }, 400);
    }
  }

  // Handle run button click
  runButton.addEventListener('click', function() {
    // Show the about content with a smooth fade-in effect
    aboutContent.style.display = 'block';
    aboutContent.style.opacity = '0';
    aboutContent.style.transform = 'translateY(20px)';
    
    // Trigger the animation
    setTimeout(() => {
      aboutContent.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      aboutContent.style.opacity = '1';
      aboutContent.style.transform = 'translateY(0)';
    }, 10);
    
    // Scroll to the about content
    setTimeout(() => {
      aboutContent.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  });

  // Start the animation sequence
  setTimeout(typeFirstLine, 800);
}); 