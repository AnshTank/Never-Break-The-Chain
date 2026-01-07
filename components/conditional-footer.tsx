"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "../components/footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const authPages = [
    "/welcome",
    "/login",
    "/signup",
    "/forgot-password",
    "/delete-account",
    "/timer",
  ];
  const isAuthPage = authPages.includes(pathname);

  useEffect(() => {
    if (pathname === "/") {
      setIsLoading(!!document.querySelector('[data-loading="true"]'));
    }
  }, [pathname]);

  if (isAuthPage || isLoading) return null;
  return <Footer />;
}
