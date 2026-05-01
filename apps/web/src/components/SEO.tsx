import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image = '/assets/Logo2.png', 
  url = 'https://camarainmobiliariadebolivar.com',
  type = 'website'
}) => {
  const baseTitle = 'Cámara Inmobiliaria del Estado Bolívar (CIBIR)';
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  const defaultDescription = 'Página oficial de la Cámara Inmobiliaria del Estado Bolívar. Agremiamos a profesionales inmobiliarios, promovemos la ética, formación continua y el desarrollo del sector de bienes raíces en la región.';
  const defaultKeywords = 'cámara inmobiliaria bolívar, bienes raíces puerto ordaz, inmobiliarias ciudad bolívar, formación inmobiliaria, cibir, profesionales inmobiliarios venezuela';

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set or create meta tags
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', description || defaultDescription);
    setMetaTag('name', 'keywords', keywords || defaultKeywords);
    setMetaTag('name', 'robots', 'index, follow');

    // OpenGraph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description || defaultDescription);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Cámara Inmobiliaria de Bolívar');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description || defaultDescription);
    setMetaTag('name', 'twitter:image', image);

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

  }, [fullTitle, description, keywords, image, url, type]);

  // Structured Data (JSON-LD) for Organization
  useEffect(() => {
    const scriptId = 'structured-data-org';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Cámara Inmobiliaria del Estado Bolívar",
      "alternateName": "CIBIR",
      "url": "https://camarainmobiliariadebolivar.com",
      "logo": "https://camarainmobiliariadebolivar.com/assets/Logo2.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "",
        "contactType": "customer service",
        "areaServed": "VE",
        "availableLanguage": "Spanish"
      },
      "sameAs": [
        "https://www.instagram.com/camarainmobiliariabolivar",
        "https://twitter.com/camarainmobiliariabolivar"
      ]
    };

    script.text = JSON.stringify(structuredData);
  }, []);

  return null;
};

export default SEO;
