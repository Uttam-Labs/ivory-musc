import { redirect } from "next/navigation";
import { SHOP_HREF } from "@/lib/navigation";

export default function CollectionsPage() {
  redirect(SHOP_HREF);
}
