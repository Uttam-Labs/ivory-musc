import { defineQuery } from "next-sanity";
export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{title, description, logo, announcement, navigation, contactEmail, instagramUrl, facebookUrl, footerColumns[]{heading, links[]{label, href}}, copyright, theme}`);
export const HEADER_SETTINGS_QUERY = defineQuery(`*[_id == "headerSettings"][0]{title, logo, logoSizeDesktop, logoSizeMobile, navigation[]{label, href}, showSearch, searchHref, showAccount, accountHref, showCart, cartHref}`);
export const FOOTER_SETTINGS_QUERY = defineQuery(`*[_id == "footerSettings"][0]{footerColumns[]{heading, links[]{label, href}}, contactHeading, contactEmail, socialHeading, instagramUrl, facebookUrl, copyright}`);
export const HOME_PAGE_QUERY = defineQuery(`*[_type == "homePage"][0]{_updatedAt, title, sections[]{..., collectionHandle, image{..., alt}, features[]{..., icon}}}`);
export const ABOUT_PAGE_QUERY = defineQuery(`*[_id == "aboutPage"][0]{_updatedAt,title,sections[]{...,image{...,alt},items[]{...,icon{...,alt}},cards[]{...,image{...,alt}}}}`);
export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{title, seoDescription, body}`);
