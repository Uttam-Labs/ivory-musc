"use client";

import { useState } from "react";
import styles from "@/app/faq/faq.module.css";

export type FaqItem = { _key?: string; question?: string; answer?: string };

function Answer({ text }: { text?: string }) {
  if (!text) return null;
  return text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph.replace(/\s*\n\s*/g, " ")}</p>);
}

export function FaqAccordion({ items, defaultOpenItem = 1 }: { items: FaqItem[]; defaultOpenItem?: number }) {
  const initial = defaultOpenItem > 0 && defaultOpenItem <= items.length ? defaultOpenItem - 1 : null;
  const [openIndex, setOpenIndex] = useState<number | null>(initial);

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const id = `faq-answer-${item._key || index}`;
        return (
          <article className={`${styles.item} faq-mod__item ${open ? styles.itemOpen : ""}`} key={item._key || index}>
            <h3>
              <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpenIndex(open ? null : index)}>
                <span>{item.question}</span>
                <span className={styles.symbol} aria-hidden="true">{open ? "×" : "+"}</span>
              </button>
            </h3>
            <div id={id} className={styles.answer} aria-hidden={!open}>
              <div><Answer text={item.answer} /></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
