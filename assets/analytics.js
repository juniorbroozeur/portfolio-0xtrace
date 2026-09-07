// Google Analytics 4 - configuration
// Fichier externe volontairement : un script inline obligerait a
// autoriser script-src 'unsafe-inline' dans la CSP.

window.dataLayer = window.dataLayer || [];

function gtag() {
  dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', 'G-66G0GLY5YP', { anonymize_ip: true });
