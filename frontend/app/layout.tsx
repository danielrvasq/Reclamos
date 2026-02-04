import type { Metadata } from "next";
import "./index.css";
import "./shared-styles.css";
import "./responsive-utils.css";

export const metadata: Metadata = {
  title: "Reclamos",
  description: "Sistema de gestión de reclamos",
  icons: {
    icon: "/Plomada-03.ico",
    shortcut: "/Plomada-03.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
