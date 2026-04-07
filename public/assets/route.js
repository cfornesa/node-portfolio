// Get the domain name for the current page
const domainName = window.location.hostname;

// Reset brand class text content based on domain
// if (domainName === 'chris.com.ph' || domainName === 'chrisfornesa.com' || domainName === 'cfornesa.com' || domainName === 'localhost') 
if (domainName === 'chris.com.ph' || domainName === 'chrisfornesa.com' || domainName === 'cfornesa.com') 
{
    // Redirect to the /about page
    window.location.href = '/about';
}