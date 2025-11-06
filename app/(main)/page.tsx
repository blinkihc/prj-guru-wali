// Root page - redirects to dashboard
// Last updated: 2025-11-06

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
