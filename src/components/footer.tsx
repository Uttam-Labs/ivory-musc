import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "./social-icons";
type Column = {
  heading?: string;
  links?: Array<{ label?: string; href?: string }>;
};
export function Footer({
  contactHeading,
  email,
  socialHeading,
  instagram,
  facebook,
  columns = [],
  copyright,
}: {
  contactHeading?: string;
  email?: string;
  socialHeading?: string;
  instagram?: string;
  facebook?: string;
  columns?: Column[];
  copyright?: string;
}) {
  if (!email && !instagram && !facebook && !columns.length && !copyright)
    return null;
  const dynamicCopyright = copyright?.replace(
    /\b(?:19|20)\d{2}\b/g,
    String(new Date().getFullYear()),
  );
  return (
    <footer className="footer bg-[#fff9f3] text-[var(--foreground)] pt-20 sm:pt-24 lg:pt-36">
      <div className="footer__top mx-auto flex max-w-[1440px] flex-col items-center gap-12 border-t border-[var(--foreground)]/20 px-5 py-10 text-center md:py-12">
        {columns.map((column, index) => (
          <div key={column.heading || index}>
            {column.heading && (
              <h3 className="mb-3 footer--heading text-base">{column.heading}</h3>
            )}
            <div className="footer--links flex flex-wrap items-center justify-center gap-x-10 lg:gap-x-20 gap-y-2">
              {column.links?.map((link, i) =>
                link.href && link.label ? (
                  <Link
                    className="transition-opacity hover:opacity-60"
                    key={link.href || i}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        ))}
        {email && (
          <div>
            {contactHeading && (
              <h3 className="mb-3 footer--heading text-base">{contactHeading}</h3>
            )}
            <p>Email - {email}</p>
          </div>
        )}
        {(instagram || facebook) && (
          <div className="footer__socials lg:pt-12">
            {socialHeading && (
              <h3 className="mb-3 footer--heading text-base">{socialHeading}</h3>
            )}
            <div className="flex justify-center gap-3">
              {facebook && (
                <a
                  aria-label="Facebook"
                  className="inline-flex rounded-full transition duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-stone-900 motion-reduce:transform-none"
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FacebookIcon className="size-[30px] lg:size-[50px]" />
                </a>
              )}
              {instagram && (
                <a
                  aria-label="Instagram"
                  className="inline-flex rounded-full transition duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-stone-900 motion-reduce:transform-none"
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                >
                  <InstagramIcon className="size-[30px] lg:size-[50px]" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      {dynamicCopyright && (
        <div className="footer__bottom mx-auto max-w-[1440px] border-t border-[var(--foreground)]/20 px-6 py-10 text-center">
          {dynamicCopyright}
        </div>
      )}
    </footer>
  );
}
