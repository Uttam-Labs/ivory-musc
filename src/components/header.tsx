"use client";

import Image from "next/image";
import Link from "next/link";
import { LoaderCircle, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Cart, Product } from "@/lib/shopify/types";
import { AccountIcon, CartIcon, SearchIcon } from "./header-icons";

type NavItem = { label?: string; href?: string };
type Props = {
  title?: string;
  logoUrl?: string;
  logoSizeDesktop?: number;
  logoSizeMobile?: number;
  navigation?: NavItem[];
  showSearch?: boolean;
  searchHref?: string;
  showAccount?: boolean;
  accountHref?: string;
  showCart?: boolean;
  cartHref?: string;
};

export function Header({
  title,
  logoUrl,
  logoSizeDesktop = 100,
  logoSizeMobile = 100,
  navigation = [],
  showSearch = false,
  showAccount = false,
  accountHref,
  showCart = false,
}: Props) {
  const pathname = usePathname();
  const overlaysHero = pathname === "/" || pathname === "/about";
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const menuCloseButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onCartUpdated = (event: Event) => {
      setCart((event as CustomEvent<Cart>).detail);
      setCartOpen(true);
    };
    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
  }, []);

  useEffect(() => {
    if (!searchOpen && !cartOpen && !menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setCartOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [searchOpen, cartOpen, menuOpen]);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchInput.current?.focus(), 150);
  }, [searchOpen]);

  useEffect(() => {
    if (menuOpen)
      window.setTimeout(() => menuCloseButton.current?.focus(), 180);
  }, [menuOpen]);

  useEffect(() => {
    if (!searchOpen || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          {
            signal: controller.signal,
          },
        );
        const payload = await response.json();
        setResults(response.ok ? payload.products || [] : []);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, searchOpen]);

  async function openCart() {
    setCartOpen(true);
    const cartId = localStorage.getItem("shopify-cart-id");
    if (!cartId) return setCart(null);
    setCartLoading(true);
    try {
      const response = await fetch(
        `/api/cart?id=${encodeURIComponent(cartId)}`,
      );
      const payload = await response.json();
      setCart(payload.cart || null);
    } finally {
      setCartLoading(false);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (query.trim())
      window.location.assign(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  if (!title && !logoUrl && !navigation.length) return null;
  const iconClass =
    "inline-flex size-9 items-center justify-center rounded-full transition duration-300 hover:bg-white/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2";

  return (
    <>
      <header
        className={`${overlaysHero ? "absolute text-white" : "relative text-[var(--foreground)]"} z-50 w-full`}
      >
        <div className="mx-auto grid h-[76px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 lg:px-8">
          <nav className="hidden header__nav items-center gap-7 text-[10px] lg:flex">
            {navigation.map((item) =>
              item.href && item.label ? (
                <Link
                  aria-current={
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                      ? "page"
                      : undefined
                  }
                  className={`menu-link border-b pb-1 transition-colors ${
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                      ? "border-current"
                      : "border-transparent hover:border-current/50 hover:opacity-65"
                  }`}
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : null,
            )}
          </nav>
          {navigation.length > 0 && (
            <button
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setMenuOpen(true)}
              className={`${iconClass} justify-self-start lg:hidden`}
            >
              <Menu size={20} />
            </button>
          )}
          <Link
            href="/"
            className="heading-logo-link mt-1 flex h-[76px] min-w-[92px] self-start items-start justify-center overflow-visible"
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={title || "Logo"}
                width={92}
                height={86}
                priority
                style={
                  {
                    "--logo-scale-mobile": logoSizeMobile / 100,
                    "--logo-scale-desktop": logoSizeDesktop / 100,
                  } as React.CSSProperties
                }
                className="header-logo h-[86px] w-[92px] object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,.1)]"
              />
            ) : title ? (
              <span className="font-heading text-2xl">{title}</span>
            ) : null}
          </Link>
          <div className="header__icons flex justify-self-end gap-0.5">
            {showSearch && (
              <button
                className={`${iconClass} header--icon search-button`}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <SearchIcon className="size-[18px]" />
              </button>
            )}
            {showAccount && accountHref && (
              <Link
                className={`${iconClass} header--icon icon-account`}
                href={accountHref}
                aria-label="Account"
              >
                <AccountIcon className="size-[19px]" />
              </Link>
            )}
            {showCart && (
              <button
                className={`${iconClass} relative header--icon icon-cart`}
                onClick={openCart}
                aria-label="Cart"
              >
                <CartIcon className="h-[19px] w-[17px]" />
                {cart?.totalQuantity ? (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-white text-[9px] text-stone-900">
                    {cart.totalQuantity}
                  </span>
                ) : null}
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[70] transition-[visibility,background-color] duration-500 lg:hidden ${
          menuOpen
            ? "visible bg-black/45"
            : "pointer-events-none invisible bg-black/0"
        }`}
        onMouseDown={() => setMenuOpen(false)}
      >
        <aside
          id="mobile-navigation-drawer"
          aria-label="Mobile navigation"
          aria-modal="true"
          role="dialog"
          className={`flex h-dvh w-[84vw] max-w-[340px] flex-col bg-[#fff9f3] text-stone-900 shadow-[18px_0_45px_rgba(0,0,0,.2)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-stone-900/10 px-6">
            <p className="font-heading text-xl text-[var(--accent)]">Menu</p>
            <button
              ref={menuCloseButton}
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2"
            >
              <X size={21} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-7">
            {navigation.map((item) =>
              item.href && item.label ? (
                <Link
                  onClick={() => setMenuOpen(false)}
                  aria-current={
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                      ? "page"
                      : undefined
                  }
                  className={`block border-b border-stone-900/10 py-3.5 text-[15px] tracking-[.01em] transition-colors hover:text-[var(--accent)] ${
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                      ? "text-[var(--accent)]"
                      : "text-stone-800"
                  }`}
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : null,
            )}
          </nav>

          {title && (
            <div className="border-t border-stone-900/10 px-6 py-6 text-center font-heading text-sm tracking-[.16em] text-stone-500 uppercase">
              {title}
            </div>
          )}
        </aside>
      </div>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/35 backdrop-blur-[2px]"
          onMouseDown={() => setSearchOpen(false)}
        >
          <section
            className="search-panel-enter max-h-[88vh] overflow-y-auto bg-[#fffaf5] px-6 pb-10 pt-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center justify-between">
                <p className="font-heading text-xl text-[var(--accent)]">
                  Search products
                </p>
                <button
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full p-2 hover:bg-black/5"
                >
                  <X size={22} />
                </button>
              </div>
              <form
                onSubmit={submitSearch}
                className="mt-5 flex border-b border-stone-400"
              >
                <SearchIcon className="mr-4 size-5 shrink-0 self-center" />
                <input
                  ref={searchInput}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What are you looking for?"
                  className="min-w-0 flex-1 bg-transparent py-4 text-base outline-none placeholder:text-stone-400"
                />
                {searching && (
                  <LoaderCircle className="size-5 self-center animate-spin" />
                )}
              </form>
              {query.trim().length >= 2 && !searching && (
                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {results.map((product) => (
                    <Link
                      onClick={() => setSearchOpen(false)}
                      href={`/products/${product.handle}`}
                      key={product.id}
                      className="group grid grid-cols-[72px_1fr] gap-3 lg:block"
                    >
                      {product.featuredImage && (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          width={240}
                          height={300}
                          className="aspect-[4/5] w-[72px] object-cover lg:w-full"
                        />
                      )}
                      <div className="lg:mt-3">
                        <p className="font-heading text-base text-[var(--accent)]">
                          {product.title}
                        </p>
                        <p className="mt-1 text-[11px]">
                          {formatMoney(product.priceRange.minVariantPrice)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {query.trim().length >= 2 && !searching && !results.length && (
                <p className="py-12 text-center text-sm text-stone-500">
                  No products found.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      <div
        aria-hidden={!cartOpen}
        className={`fixed inset-0 z-[90] transition-[visibility,background-color] duration-500 ${
          cartOpen
            ? "visible bg-black/40"
            : "pointer-events-none invisible bg-black/0"
        }`}
        onMouseDown={() => setCartOpen(false)}
      >
        <aside
          aria-label="Shopping cart"
          aria-modal="true"
          role="dialog"
          className={`ml-auto flex h-dvh w-full max-w-[430px] flex-col bg-[#fffaf5] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex h-20 items-center justify-between border-b border-stone-300 px-6">
            <h2 className="font-heading text-2xl text-[var(--accent)]">
              Your cart {cart?.totalQuantity ? `(${cart.totalQuantity})` : ""}
            </h2>
            <button
              aria-label="Close cart"
              onClick={() => setCartOpen(false)}
              className="rounded-full p-2 hover:bg-black/5"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {cartLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : cart?.lines.nodes.length ? (
              <div className="space-y-6">
                {cart.lines.nodes.map((line) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-[88px_1fr] gap-4"
                  >
                    {line.merchandise.image && (
                      <Image
                        src={line.merchandise.image.url}
                        alt={
                          line.merchandise.image.altText ||
                          line.merchandise.product.title
                        }
                        width={176}
                        height={220}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    )}
                    <div>
                      <Link
                        onClick={() => setCartOpen(false)}
                        href={`/products/${line.merchandise.product.handle}`}
                        className="font-heading text-lg text-[var(--accent)]"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      {line.merchandise.title !== "Default Title" && (
                        <p className="mt-1 text-[10px] text-stone-500">
                          {line.merchandise.title}
                        </p>
                      )}
                      <p className="mt-2 text-xs">Qty: {line.quantity}</p>
                      <p className="mt-2 text-xs">
                        {formatMoney(line.merchandise.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <CartIcon className="h-10 w-9 text-stone-400" />
                <p className="mt-5 font-heading text-xl">Your cart is empty</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-5 border border-[var(--accent)] px-6 py-3 text-[10px] uppercase tracking-wider"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </div>
          {cart?.lines.nodes.length ? (
            <div className="border-t border-stone-300 p-6">
              <div className="mb-5 flex justify-between text-sm">
                <span>Subtotal</span>
                <strong>{formatMoney(cart.cost.subtotalAmount)}</strong>
              </div>
              <a
                href={cart.checkoutUrl}
                className="flex h-12 items-center justify-center bg-[#a95850] text-xs uppercase tracking-[.14em] text-white transition hover:bg-[#8f453f]"
              >
                Checkout
              </a>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
