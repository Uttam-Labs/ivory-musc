import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type SiteContainerProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function SiteContainer<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...props
}: SiteContainerProps<T>) {
  const Component = as || "div";
  return (
    <Component
      className={`mx-auto w-full max-w-[1920px] px-6 sm:px-12 xl:px-24 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
