"use client";

import { useEffect } from "react";

interface ClientTokenHandlerProps {
  onTokenRetrieved?: (tokenData: {
    localStorage: string | null;
    cookie: string | null;
  }) => void;
}

export default function ClientTokenHandler({
  onTokenRetrieved,
}: ClientTokenHandlerProps) {
  useEffect(() => {
    const tokenLocal = localStorage.getItem("token");
    const cookies = document.cookie.split(";");
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    const accessToken = accessTokenCookie
      ? accessTokenCookie.split("=")[1]
      : null;
    if (onTokenRetrieved) {
      onTokenRetrieved({
        localStorage: tokenLocal,
        cookie: accessToken,
      });
    }
  }, [onTokenRetrieved]);
  return null;
}
