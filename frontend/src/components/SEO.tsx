import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  structuredData?: object;
}

export function SEO({
  title = 'CureLex - Healthcare Telemedicine Platform',
  description = 'Comprehensive healthcare platform with telemedicine capabilities, patient portal, and secure medical records management. HIPAA compliant and accessible.',
  keywords = ['healthcare', 'telemedicine', 'patient portal', 'doctor dashboard', 'medical records'],
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  noIndex = false,
  structuredData,
}: SEOProps) {
  const fullTitle = title.includes('CureLex') ? title : `${title} | CureLex Healthcare`;
  const fullUrl = url ? `https://curelex.com${url}` : 'https://curelex.com';
  const fullImage = image.startsWith('http') ? image : `https://curelex.com${image}`;

  return (\n    <Head>\n      <title>{fullTitle}</title>\n      <meta name=\"description\" content={description} />\n      <meta name=\"keywords\" content={keywords.join(', ')} />\n      \n      {noIndex && <meta name=\"robots\" content=\"noindex, nofollow\" />}\n      \n      {/* Open Graph */}\n      <meta property=\"og:type\" content={type} />\n      <meta property=\"og:title\" content={fullTitle} />\n      <meta property=\"og:description\" content={description} />\n      <meta property=\"og:image\" content={fullImage} />\n      <meta property=\"og:url\" content={fullUrl} />\n      <meta property=\"og:site_name\" content=\"CureLex Healthcare\" />\n      \n      {/* Twitter */}\n      <meta name=\"twitter:card\" content=\"summary_large_image\" />\n      <meta name=\"twitter:title\" content={fullTitle} />\n      <meta name=\"twitter:description\" content={description} />\n      <meta name=\"twitter:image\" content={fullImage} />\n      \n      {/* Canonical URL */}\n      <link rel=\"canonical\" href={fullUrl} />\n      \n      {/* Structured Data */}\n      {structuredData && (\n        <script\n          type=\"application/ld+json\"\n          dangerouslySetInnerHTML={{\n            __html: JSON.stringify(structuredData),\n          }}\n        />\n      )}\n    </Head>\n  );\n}