import { redirect } from "next/navigation";
import { getGuestDefaultPath } from "@/lib/public-navigation";

export default function RootPage() {
  redirect(getGuestDefaultPath());
}
