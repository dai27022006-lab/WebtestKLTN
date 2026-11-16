import Script from 'next/script';

const GA4_ID_PATTERN = /^G-[A-Z0-9]+$/i;
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

export function GoogleTagManager() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  if (!measurementId) {
    return null;
  }

  const safeId = JSON.stringify(measurementId).replace(/</g, '\\u003c');

  if (GA4_ID_PATTERN.test(measurementId)) {
    const ga4InitScript = [
      'window.dataLayer = window.dataLayer || [];',
      'function gtag(){window.dataLayer.push(arguments);}',
      'window.gtag = window.gtag || gtag;',
      "window.gtag('js', new Date());",
      `window.gtag('config', ${safeId});`,
    ].join('\n');

    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
          strategy="afterInteractive"
          fetchPriority="low"
        />
        <Script id="dreamteam-ga4-init" strategy="afterInteractive">
          {ga4InitScript}
        </Script>
      </>
    );
  }

  if (GTM_ID_PATTERN.test(measurementId)) {
    const gtmInitScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(i);if(f&&f.parentNode){f.parentNode.insertBefore(j,f);}else{d.head.appendChild(j);}})(window,document,'script','dataLayer',${safeId});`;

    return (
      <Script id="dreamteam-gtm-init" strategy="afterInteractive">
        {gtmInitScript}
      </Script>
    );
  }

  return null;
}
