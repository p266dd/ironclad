"use client";

import { useState } from "react";

const MobileMessage = () => <div>Mobile Message</div>;
const Message = () => <div>Message</div>;

export default function ProductModalHint() {
  const [message, setMessage] = useState<React.ReactElement | null>(null);

  const SESSION_KEY = "product-modal-hint";
  const hasBeenShown = localStorage.getItem(SESSION_KEY);

  if (!hasBeenShown) {
    const isMobile = /Mobile/.test(navigator.userAgent);

    if (isMobile) {
      setMessage(MobileMessage);
    } else {
      setMessage(Message);
    }

    sessionStorage.setItem(SESSION_KEY, "true");
  }

  if (!message) {
    return;
  }

  return message;
}
