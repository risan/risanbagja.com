import React from "react";
import Helmet from "react-helmet";
import { graphql, StaticQuery } from "gatsby";

const LEADING_SLASH = /^\//;
const TRAILING_SLASH = /\/$/;

const getStructuredData = ({
  title,
  baseUrl,
  description,
  datePublished,
  dateModified,
  image,
  author,
  publisherName,
  publisherLogo
}) => {
  const schema = {
    "@context": "http://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": baseUrl
    },
    headline: title,
    description,
    datePublished,
    dateModified: dateModified ? dateModified : datePublished,
    author: {
      "@type": "Person",
      name: author
    }
  };

  if (image) {
    schema.image = image;
  }

  if (publisherName) {
    schema.publisher = {
      "@type": "Organization",
      name: publisherName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo
      }
    }
  }

  return schema;
};

export default ({
  path,
  title,
  description,
  lang,
  locale,
  datePublished,
  dateModified,
  author,
  image: { src: imageSrc, width: imageWidth, height: imageHeight } = {},
  concatenateSiteTitle = true,
  concatenateSiteTitleString = '|',
  prependSiteTitle = true,
  useStructuredData = true
}) => (
  <StaticQuery
    query={graphql`
      {
        site {
          pathPrefix
          siteMetadata {
            siteUrl
            lang
            title
            description
            author
            seo {
              fbAppId
              locale
              twitterCreator
              twitterSite
              publisherName
              publisherLogo
            }
          }
        }
      }
    `}
    render={data => {
      const { seo, ...site } = data.site.siteMetadata;
      const pathPrefix = site.pathPrefix
        ? site.pathPrefix === "/" ? "" : site.pathPrefix
        : "";
      const baseUrl = site.siteUrl.replace(TRAILING_SLASH, '') + pathPrefix;
      const descriptionValue = description ? description : site.description;

      let pageTitle = title;

      if (concatenateSiteTitle) {
        pageTitle = prependSiteTitle
          ? `${pageTitle} ${concatenateSiteTitleString} ${site.title}`
          : `${site.title} ${concatenateSiteTitleString} ${pageTitle}`;
      }

      const url = path => path === "/"
        ? baseUrl
        : `${baseUrl}/${path.replace(LEADING_SLASH, '')}`;

      let localeValue = locale ? locale : seo.locale;

      if (lang && !locale) {
        localeValue = lang;
      }

      return (
        <Helmet htmlAttributes={{ lang: lang ? lang : site.lang }}>
          <title>{pageTitle}</title>
          <link rel="canonical" href={url(path)} />
          <meta name="description" content={descriptionValue} />

          <meta property="og:url" content={url(path)} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={descriptionValue} />
          <meta property="og:locale" content={localeValue} />
          {imageSrc &&
            <meta property="og:image" content={url(imageSrc)} />}
          {imageWidth &&
            <meta property="og:image:width" content={imageWidth} />}
          {imageHeight &&
            <meta property="og:image:height" content={imageHeight} />}
          {seo.fbAppId &&
            <meta property="og:fb:app_id" content={seo.fbAppId} />}

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={descriptionValue} />
          {imageSrc &&
            <meta name="twitter:image" content={url(imageSrc)} />}
          {seo.twitterCreator &&
            <meta name="twitter:creator" content={seo.twitterCreator} />}
          {seo.twitterSite &&
            <meta name="twitter:site" content={seo.twitterSite} />}

          {useStructuredData && (
            <script type="application/ld+json">
              {JSON.stringify(
                getStructuredData({
                  title,
                  baseUrl,
                  description: descriptionValue,
                  datePublished,
                  dateModified,
                  image: url(imageSrc),
                  author: author ? author : site.author,
                  publisherName: seo.publisherName,
                  publisherLogo: seo.publisherLogo
                })
              )}
            </script>
          )}
        </Helmet>
      );
    }}
  />
);
