"use client";

import { useFormStatus } from "react-dom";
import { LoadingOverlay } from "@/components/loading-overlay";

// Drop inside a <form> that posts a server action — reads the parent
// form's pending state via useFormStatus and shows the centred screen
// spinner overlay while the request is in flight.
export function FormPendingOverlay() {
  const { pending } = useFormStatus();
  return <LoadingOverlay show={pending} />;
}
