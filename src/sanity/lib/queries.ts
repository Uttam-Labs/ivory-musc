import { defineQuery } from "next-sanity";
export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{title, description, titleTemplate, favicon, socialImage{...,alt}, keywords, locale, themeColor, allowIndex, allowFollow, logo, announcement, navigation, contactEmail, instagramUrl, facebookUrl, footerColumns[]{heading, links[]{label, href}}, copyright, theme}`);
export const HEADER_SETTINGS_QUERY = defineQuery(`*[_id == "headerSettings"][0]{title, logo, logoSizeDesktop, logoSizeMobile, navigation[]{label, href}, showSearch, searchHref, showAccount, accountHref, showCart, cartHref}`);
export const FOOTER_SETTINGS_QUERY = defineQuery(`*[_id == "footerSettings"][0]{footerColumns[]{heading, links[]{label, href}}, contactHeading, contactEmail, socialHeading, instagramUrl, facebookUrl, copyright}`);
export const HOME_PAGE_QUERY = defineQuery(`*[_type == "homePage"][0]{_updatedAt, title, sections[]{..., collectionHandle, image{..., alt}, features[]{..., icon}}}`);

export const WAITLIST_PAGE_QUERY = defineQuery(`*[_id == "waitlistPage"][0]{seoTitle, seoDescription, backgroundImage{..., alt, "assetUrl": asset->url}, brandName, tagline, heading, description, formHeading, emailLabel, emailPlaceholder, submitLabel, submittingLabel, confirmationText, unsubscribeText, successEyebrow, successHeading, successMessage, alreadySubscribedMessage, successClosing, fallbackErrorMessage}`);
export const ABOUT_PAGE_QUERY = defineQuery(`*[_id == "aboutPage"][0]{_updatedAt,title,sections[]{...,image{...,alt},items[]{...,icon{...,alt}},cards[]{...,image{...,alt}}}}`);
export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{title, seoDescription, body}`);
export const PRODUCT_PAGE_QUERY = defineQuery(`*[_id == "productPage" && _type == "productPage"][0]{_updatedAt,title,sections[]{...}}`);
export const COLLECTION_PAGE_QUERY = defineQuery(`*[_id == "collectionPage" && _type == "collectionPage"][0]{_updatedAt,heading}`);
export const FAQ_PAGE_QUERY = defineQuery(`*[_id == "faqPage" && _type == "faqPage"][0]{_updatedAt,title,seoDescription,sections[]{...,image{...,alt},items[]{...}}}`);
export const CONTACT_PAGE_QUERY = defineQuery(`*[_id == "contactPage" && _type == "contactPage"][0]{_updatedAt,title,seoDescription,sections[]{...,image{...,alt}}}`);
export const BLOG_PAGE_QUERY = defineQuery(`*[_type == "blogPage"] | order(_updatedAt desc)[0]{_updatedAt,title,seoDescription,sections[]{...,image{...,alt}}}`);
export const ARTICLE_PAGE_QUERY = defineQuery(`*[_id == "articlePage" && _type == "articlePage"][0]{_updatedAt,shopifyBlogHandle,recentLimit,visibility,labels,sharing}`);
export const ACCOUNT_CONTENT_QUERY = defineQuery(`*[_id == $id][0]{...}`);
