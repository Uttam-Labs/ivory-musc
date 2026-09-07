"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import styles from "./silk-guide.module.css";

export type Characteristic = { _key?: string; title?: string; body?: string };
export type GuideSection = { _key?: string; navigationLabel?: string; heading?: string; body?: string; closingText?: string; bullets?: string[]; notes?: Array<{ _key?: string; eyebrow?: string; title?: string; body?: string }> };

function Paragraphs({ text }: { text?: string }) {
  return text?.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph.replace(/\s*\n\s*/g, " ")}</p>) || null;
}

export function Characteristics({ items }: { items: Characteristic[] }) {
  const [open, setOpen] = useState(0);
  return <div className={styles.accordion}>{items.map((item, index) => {
    const expanded = open === index;
    const panelId = `silk-characteristic-${index}`;
    return <article className={styles.accordionItem} key={item._key || item.title || index}>
      <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? -1 : index)}><span>{item.title}</span><Plus className={expanded ? styles.accordionIconOpen : styles.accordionIcon} size={16} /></button>
      <div id={panelId} aria-hidden={!expanded} className={`${styles.accordionPanel} ${expanded ? styles.accordionPanelOpen : ""}`}><div><div className={styles.accordionBody}><Paragraphs text={item.body} /></div></div></div>
    </article>;
  })}</div>;
}

export function DetailedGuide({ sections }: { sections: GuideSection[] }) {
  const [active, setActive] = useState(0);
  const section = sections[active] || sections[0];
  if (!section) return null;
  const hasNotes = Boolean(section.notes?.length);
  const extractedClosing = section.bullets?.length && !section.closingText
    ? section.body?.match(/\s+(These questions will help narrow your selection\.)\s*$/i)
    : null;
  const body = extractedClosing ? section.body?.slice(0, extractedClosing.index).trim() : section.body;
  const closingText = section.closingText || extractedClosing?.[1];
  return <div className={styles.guideLayout}>
    <nav className={styles.guideNav} aria-label="Silk guide topics">{sections.map((item, index) => <button type="button" key={item._key || item.navigationLabel || index} className={active === index ? styles.guideNavActive : ""} onClick={() => setActive(index)}>{item.navigationLabel}</button>)}</nav>
    <article className={`${styles.guideContent} ${hasNotes ? "" : styles.guideContentFull}`}>
      <h2>{section.heading}</h2>
      <Paragraphs text={body} />
      {section.bullets?.length ? <ol>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ol> : null}
      {closingText ? <p className={styles.guideClosing}>{closingText}</p> : null}
      {hasNotes ? <div className={styles.notes}>{section.notes!.map((note, index) => <div key={note._key || note.title || index}><small>{note.eyebrow}</small><h3>{note.title}</h3><Paragraphs text={note.body} /></div>)}</div> : null}
    </article>
  </div>;
}
