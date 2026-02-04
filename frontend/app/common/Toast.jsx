"use client";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

function Toast({ visible, message, type = "success" }) {
  const Icon =
    type === "success"
      ? CheckCircle
      : type === "error"
      ? XCircle
      : type === "warning"
      ? AlertTriangle
      : Info;

  return (
    <div
      className={`toast ${type} ${visible ? "show" : ""}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} className="toast-icon" />
      <span>{message}</span>
    </div>
  );
}

export default Toast;
