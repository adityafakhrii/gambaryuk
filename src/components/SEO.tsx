import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
    schema?: Record<string, any>;
}

export function SEO({ title, description, path = '', image = '/logo.webp', schema }: SEOProps) {
    const siteUrl = 'https://gambaryuk.com';
    // Format paths consistently
    const cleanPath = path === '/' ? '/' : path;
    const url = `${siteUrl}${cleanPath}`;
    const fullTitle = `${title} | GambarYuk`;
    const { language } = useLanguage();

    const currentLocale = language === 'id' ? 'id_ID' : 'en_US';
    const alternateLocale = language === 'id' ? 'en_US' : 'id_ID';

    // Construct language variant URLs for hreflang
    const idUrl = cleanPath === '/' ? `${siteUrl}/?lang=id` : `${siteUrl}${cleanPath}?lang=id`;
    const enUrl = cleanPath === '/' ? `${siteUrl}/?lang=en` : `${siteUrl}${cleanPath}?lang=en`;

    return (
        <Helmet>
            {/* Dynamic HTML lang attribute */}
            <html lang={language} />

            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Multilingual alternates (hreflang) */}
            <link rel="alternate" hrefLang="id" href={idUrl} />
            <link rel="alternate" hrefLang="en" href={enUrl} />
            <link rel="alternate" hrefLang="x-default" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${siteUrl}${image}`} />
            <meta property="og:site_name" content="GambarYuk" />
            <meta property="og:locale" content={currentLocale} />
            <meta property="og:locale:alternate" content={alternateLocale} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={`${siteUrl}${image}`} />

            {/* JSON-LD Schema */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
}

