// Get the domain name for the current page
const domainName = window.location.hostname;

// Select #sideNav element
const sideNav = document.getElementById('sideNav');

// Select #hamNav element
const hamNav = document.getElementById('hamNav');

// Select #headerNav element
const headerNav = document.getElementById('headerNav');

// Reset brand class text content based on domain
// if (domainName === 'chris.com.ph' || domainName === 'chrisfornesa.com' || domainName === 'cfornesa.com' || domainName === 'localhost') 
if (domainName === 'chris.com.ph' || domainName === 'chrisfornesa.com' || domainName === 'cfornesa.com') 
{
    // Replace HTML inside #sideNav with the following
    sideNav.innerHTML = `
      <a class="flex items-center gap-3 bg-primary/10 text-primary border-r-4 border-primary p-4 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="../">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-house"
        aria-hidden="true">
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>Home</a>
      <a class="flex items-center gap-3 text-on-surface-variant p-4 hover:bg-white/5 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="../readme">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-file-text"
          aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        </svg>Readme</a>
    `;

    // Replace HTML inside #hamNav with the following
    hamNav.innerHTML = `
      <a class="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="../">Home</a>
      <a class="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="../readme">Readme</a>
      <a class="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="../chat">Ask Chris</a>
      <a class="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="../resume">Resume Guide</a>
      <a class="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="../art">Art Guide</a>
      <a class="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="../tanaga">Tanaga Guide</a>
    `;

    // Replace HTML inside #headerNav with the following
    headerNav.innerHTML = `
      <span class="text-on-surface-variant transition-colors">Site:</span>
      <a class="text-on-surface-variant hover:text-primary transition-colors"
        href="../">Home</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors"
        href="../readme">Readme</a>
      <span class="text-on-surface-variant transition-colors">|</span>
      <span class="text-on-surface-variant transition-colors">Agents:</span>
      <a class="text-on-surface-variant hover:text-primary transition-colors"
        href="../chat">Ask</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors"
        href="../resume">Resume</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors"
        href="../art">Art</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors"
        href="../tanaga">Tanaga</a>
    `;

    // Replace the webpage title with "Chris Fornesa | Data & Analytics Professional - About Me"
    document.title = "Chris Fornesa | Data & Analytics Professional - About Me";

    // Replace the webpage description meta tag content with "Portfolio of Chris Fornesa, a Data & Analytics Professional specializing in quantitative storytelling, machine learning, and ethical AI."
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute("content", "Portfolio of Chris Fornesa, a Data & Analytics Professional specializing in quantitative storytelling, machine learning, and ethical AI.");
    }

    // Replace the webpage keywords meta tag content with "Chris Fornesa, Data Science, Analytics, Power BI, Python, Machine Learning, Portfolio"
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.setAttribute("content", "Chris Fornesa, Data Science, Analytics, Power BI, Python, Machine Learning, Portfolio");
    }

    // Replace the webpage og:title meta tag content with "Chris Fornesa | Data & Analytics Professional"
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle) {
        metaOgTitle.setAttribute("content", "Chris Fornesa | Data & Analytics Professional");
    }

    // Replace the webpage og:description meta tag content with "Portfolio of Chris Fornesa, a Data & Analytics Professional specializing in quantitative storytelling, machine learning, and ethical AI."
    const metaOgDescription = document.querySelector('meta[property="og:description"]');
    if (metaOgDescription) {
        metaOgDescription.setAttribute("content", "Portfolio of Chris Fornesa, a Data & Analytics Professional specializing in quantitative storytelling, machine learning, and ethical AI.");
    }

    // Replace all instances of class "brand" text content with "Chris Fornesa"
    const brandElements = document.querySelectorAll('.brand');
    brandElements.forEach(el => {
        el.textContent = "Chris Fornesa";
    });
}