import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
}

export function SEO({ title, description, path = '', image = '/og-image.jpg' }: SEOProps) {
    const siteUrl = 'https://gambaryuk.com'; // Replace with actual production URL
    const url = `${siteUrl}${path}`;
    const fullTitle = `${title} | GambarYuk`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${siteUrl}${image}`} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={`${siteUrl}${image}`} />
        </Helmet>
    );
}
