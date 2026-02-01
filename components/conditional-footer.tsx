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
    "/about",
  ];
  const isAuthPage = authPages.includes(pathname);

  useEffect(() => {
    if (pathname === "/" || pathname === "/dashboard") {
      // Check initial loading state
      const checkLoading = () => {
        const loadingElement = document.querySelector('[data-loading="true"]');
        setIsLoading(!!loadingElement);
      };

      checkLoading();

      // Use MutationObserver to watch for DOM changes
      const observer = new MutationObserver(checkLoading);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-loading"],
      });

      return () => observer.disconnect();
    } else {
      setIsLoading(false);
    }
  }, [pathname]);

  if (isAuthPage || isLoading) return null;
  return <Footer />;
}
