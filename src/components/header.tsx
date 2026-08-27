"use client";

import Image from "next/image";
import Link from "next/link";
import { LoaderCircle, Menu, Minus, Plus, Trash2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/format";
import { normalizeShopHref } from "@/lib/navigation";
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
  const router = useRouter();
  const normalizedPathname = pathname === "/index" ? "/" : pathname;
  const overlaysHero =
    normalizedPathname === "/" ||
    normalizedPathname === "/about" ||
    normalizedPathname === "/faq" ||
    normalizedPathname === "/contact" ||
    normalizedPathname === "/blog";
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [updatingLines, setUpdatingLines] = useState<string[]>([]);
  const [cartError, setCartError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const menuCloseButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const refreshCustomer = () =>
      fetch("/api/customer-account/summary", {
        cache: "no-store",
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) =>
          setCustomerName(data?.authenticated ? data.firstName || "" : ""),
        )
        .catch(() => undefined);
    void refreshCustomer();
    window.addEventListener("focus", refreshCustomer);
    return () => {
      controller.abort();
      window.removeEventListener("focus", refreshCustomer);
    };
  }, [pathname]);

  const refreshCart = useCallback(async () => {
    const cartId = localStorage.getItem("shopify-cart-id");
    if (!cartId) {
      setCart(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/cart?id=${encodeURIComponent(cartId)}`,
        {
          cache: "no-store",
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.cart) {
        localStorage.removeItem("shopify-cart-id");
        setCart(null);
        return;
      }
      setCart(payload.cart);
    } catch {
      // Keep the last known cart state when a background refresh is interrupted.
    }
  }, []);

  useEffect(() => {
    const onCartUpdated = (event: Event) => {
      setCart((event as CustomEvent<Cart>).detail);
      setCartOpen(true);
    };
    const onCartChanged = (event: Event) => {
      setCart((event as CustomEvent<Cart>).detail);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "shopify-cart-id") void refreshCart();
    };

    const hydrationTimer = window.setTimeout(() => void refreshCart(), 0);
    window.addEventListener("cart:updated", onCartUpdated);
    window.addEventListener("cart:changed", onCartChanged);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshCart);
    return () => {
      window.clearTimeout(hydrationTimer);
      window.removeEventListener("cart:updated", onCartUpdated);
      window.removeEventListener("cart:changed", onCartChanged);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshCart);
    };
  }, [refreshCart]);

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
    setCartLoading(true);
    try {
      await refreshCart();
    } finally {
      setCartLoading(false);
    }
  }

  async function changeCartLine(lineId: string, quantity?: number) {
    if (!cart?.id || updatingLines.includes(lineId)) return;
    const action = quantity === undefined ? "remove" : "update";
    setUpdatingLines((lines) => [...lines, lineId]);
    setCartError("");
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, cartId: cart.id, lineId, quantity }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Cart could not be updated");
      setCart(payload.cart);
      window.dispatchEvent(
        new CustomEvent("cart:changed", { detail: payload.cart }),
      );
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Please try again");
    } finally {
      setUpdatingLines((lines) => lines.filter((id) => id !== lineId));
    }
  }

  async function startCheckout() {
    if (!cart?.id || checkoutLoading) return;
    setCheckoutLoading(true);
    setCartError("");
    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cartId: cart.id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.checkoutUrl)
        throw new Error(payload.error || "Checkout could not be started");
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      setCartError(
        error instanceof Error ? error.message : "Please try again",
      );
      setCheckoutLoading(false);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (query.trim())
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  if (!title && !logoUrl && !navigation.length) return null;
  const iconClass =
    "inline-flex size-9 items-center justify-center rounded-full transition duration-300 hover:bg-white/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2";

  return (
    <>
      <header
        className={`${overlaysHero ? "absolute text-white" : "relative text-[var(--foreground)]"} z-50 w-full`}
      >
        <div className="mx-auto grid h-[100px] max-w-[1920] px-6 sm:px-12 xl:px-24 grid-cols-[1fr_auto_1fr] items-center">
          <nav className="hidden header__nav items-center gap-7 text-[10px] lg:flex">
            {navigation.map((item) =>
              item.href && item.label ? (
                <Link
                  aria-current={
                    normalizedPathname === item.href ||
                    (item.href !== "/" &&
                      normalizedPathname.startsWith(`${item.href}/`))
                      ? "page"
                      : undefined
                  }
                  className={`menu-link border-b pb-1 transition-colors ${
                    normalizedPathname === item.href ||
                    (item.href !== "/" &&
                      normalizedPathname.startsWith(`${item.href}/`))
                      ? "border-current"
                      : "border-transparent hover:border-current/50 hover:opacity-65"
                  }`}
                  key={item.href}
                  href={normalizeShopHref(item.label, item.href)}
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
            className="heading-logo-link flex h-[76px] w-[110px] min-w-[110px] max-w-[110px] self-center items-center justify-center overflow-visible"
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={title || "Logo"}
                width={92}
                height={86}
                quality={95}
                sizes="92px"
                priority
                style={
                  {
                    "--logo-scale-mobile": logoSizeMobile / 100,
                    "--logo-scale-desktop": logoSizeDesktop / 100,
                  } as React.CSSProperties
                }
                className={`header-logo h-auto max-h-[72px] w-full origin-center object-contain transition-[filter,opacity] duration-300 ${
                  overlaysHero
                    ? "drop-shadow-[0_1px_1px_rgba(0,0,0,.12)]"
                    : "brightness-0 opacity-40"
                }`}
              />
            ) : title ? (
              <span className="font-heading text-2xl">{title}</span>
            ) : null}
          </Link>
          <div className="header__icons flex justify-self-end gap-0.5">
            {showSearch && (
              <button
                className={`${iconClass} header--icon search-button`}
                onClick={() => {
                  setResults([]);
                  setSearching(false);
                  setSearchOpen(true);
                }}
                aria-label="Search"
              >
                <SearchIcon className="size-[18px]" />
              </button>
            )}
            {showAccount && accountHref && (
              customerName ? (
                <Link
                  href={accountHref}
                  aria-label={`Account for ${customerName}`}
                  title={customerName}
                  className="mx-[5px] grid size-[30px] place-items-center rounded-full bg-[#9b504a] text-[13px] font-medium uppercase leading-none text-white shadow-sm"
                >
                  {customerName.trim().charAt(0)}
                </Link>
              ) : (
                <Link
                  className={`${iconClass} header--icon icon-account`}
                  href={accountHref}
                  aria-label="Account"
                >
                  <AccountIcon className="size-[19px]" />
                </Link>
              )
            )}
            {showCart && (
              <button
                className={`${iconClass} relative header--icon icon-cart`}
                onClick={openCart}
                aria-label="Cart"
              >
                <CartIcon className="h-[19px] w-[17px]" />
                {cart?.totalQuantity ? (
                  <span className="pointer-events-none absolute right-0 top-[-1px] z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#fff9f3] bg-[#a95850] px-[4px] text-[11px] font-medium leading-none text-white shadow-[0_2px_7px_rgba(80,35,31,.25)] [font-variant-numeric:tabular-nums]">
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
                    normalizedPathname === item.href ||
                    (item.href !== "/" &&
                      normalizedPathname.startsWith(`${item.href}/`))
                      ? "page"
                      : undefined
                  }
                  className={`block border-b border-stone-900/10 py-3.5 text-[15px] tracking-[.01em] transition-colors hover:text-[var(--accent)] ${
                    normalizedPathname === item.href ||
                    (item.href !== "/" &&
                      normalizedPathname.startsWith(`${item.href}/`))
                      ? "text-[var(--accent)]"
                      : "text-stone-800"
                  }`}
                  key={item.href}
                  href={normalizeShopHref(item.label, item.href)}
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
                          quality={95}
                          sizes="(max-width: 1023px) 72px, 240px"
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
        className={`fixed inset-0 z-[120] transition-[visibility,background-color] duration-500 ${
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
          className={`ml-auto flex h-dvh w-full max-w-[480px] flex-col bg-[#fffaf5] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-stone-300 px-7">
            <h2 className="font-heading text-[22px] text-[var(--accent)]">
              Your cart {cart?.totalQuantity ? `(${cart.totalQuantity})` : ""}
            </h2>
            <button
              aria-label="Close cart"
              onClick={() => setCartOpen(false)}
              className="cursor-pointer rounded-full p-2 transition hover:bg-black/5"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-7 py-7">
            {cartLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : cart?.lines.nodes.length ? (
              <div className="space-y-7">
                {cart.lines.nodes.map((line) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-[104px_1fr] gap-5 border-b border-stone-200 pb-7 last:border-0"
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
                        quality={95}
                        sizes="104px"
                        className="aspect-[4/5] w-full bg-stone-100 object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          onClick={() => setCartOpen(false)}
                          href={`/products/${line.merchandise.product.handle}`}
                          className="font-heading text-[17px] leading-tight text-[var(--accent)] hover:opacity-70"
                        >
                          {line.merchandise.product.title}
                        </Link>
                        <button
                          type="button"
                          aria-label={`Remove ${line.merchandise.product.title}`}
                          title="Remove item"
                          disabled={updatingLines.includes(line.id)}
                          onClick={() => changeCartLine(line.id)}
                          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-stone-500 transition hover:bg-red-50 hover:text-[#a95850] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {updatingLines.includes(line.id) ? (
                            <LoaderCircle size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                      {line.merchandise.title !== "Default Title" && (
                        <p className="mt-2 text-[14px] leading-snug text-stone-500">
                          {line.merchandise.title}
                        </p>
                      )}
                      <div className="mt-4 flex h-[38px] w-[126px] items-center border border-stone-300 bg-white/50">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.merchandise.product.title} quantity`}
                          disabled={
                            line.quantity <= 1 ||
                            updatingLines.includes(line.id)
                          }
                          onClick={() =>
                            changeCartLine(line.id, line.quantity - 1)
                          }
                          className="grid h-full w-10 cursor-pointer place-items-center transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Minus size={13} />
                        </button>
                        <input
                          key={`${line.id}-${line.quantity}`}
                          aria-label={`${line.merchandise.product.title} quantity`}
                          type="number"
                          min={1}
                          max={20}
                          defaultValue={line.quantity}
                          disabled={updatingLines.includes(line.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter")
                              event.currentTarget.blur();
                          }}
                          onBlur={(event) => {
                            const next = Math.min(
                              20,
                              Math.max(
                                1,
                                Number.parseInt(
                                  event.currentTarget.value,
                                  10,
                                ) || line.quantity,
                              ),
                            );
                            event.currentTarget.value = String(next);
                            if (next !== line.quantity)
                              changeCartLine(line.id, next);
                          }}
                          className="h-full min-w-0 flex-1 appearance-none border-x border-stone-300 bg-transparent text-center text-[14px] outline-none [font-variant-numeric:tabular-nums] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={`Increase ${line.merchandise.product.title} quantity`}
                          disabled={
                            line.quantity >= 20 ||
                            updatingLines.includes(line.id)
                          }
                          onClick={() =>
                            changeCartLine(line.id, line.quantity + 1)
                          }
                          className="grid h-full w-10 cursor-pointer place-items-center transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        {line.merchandise.compareAtPrice &&
                          Number(line.merchandise.compareAtPrice.amount) >
                            Number(line.merchandise.price.amount) && (
                            <span className="text-[14px] text-stone-400 line-through">
                              {formatMoney({
                                ...line.merchandise.compareAtPrice,
                                amount: String(
                                  Number(
                                    line.merchandise.compareAtPrice.amount,
                                  ) * line.quantity,
                                ),
                              })}
                            </span>
                          )}
                        <strong className="text-[18px] font-normal text-stone-800">
                          {formatMoney(line.cost.totalAmount)}
                        </strong>
                      </div>
                      <p className="mt-1 text-[12px] text-stone-500">
                        {line.quantity}{" "}
                        {line.quantity === 1 ? "meter" : "meters"} ×{" "}
                        {formatMoney(line.cost.amountPerQuantity)}
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
            {cartError && (
              <p role="alert" className="mt-4 text-[13px] text-red-600">
                {cartError}
              </p>
            )}
          </div>
          {cart?.lines.nodes.length ? (
            <div className="border-t border-stone-300 px-7 py-6">
              <div className="mb-5 flex justify-between text-[14px]">
                <span>Subtotal</span>
                <strong>{formatMoney(cart.cost.subtotalAmount)}</strong>
              </div>
              <button
                type="button"
                onClick={startCheckout}
                disabled={checkoutLoading}
                className="flex h-[58px] w-full cursor-pointer items-center justify-center gap-2 bg-[#a95850] text-[14px] font-medium uppercase tracking-[.14em] text-white transition hover:bg-[#8f453f] disabled:cursor-wait disabled:opacity-70"
              >
                {checkoutLoading && (
                  <LoaderCircle className="animate-spin" size={17} />
                )}
                {checkoutLoading ? "Preparing checkout…" : "Checkout"}
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
