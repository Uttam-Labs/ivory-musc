import type { Metadata } from "next";
import { CartPage } from "./cart-page";

export const metadata: Metadata = {
  title: "Shopping bag | Ivory Muse",
  description: "Review your Ivory Muse selection and continue to secure checkout.",
};

export default function Page() {
  return <CartPage />;
}
