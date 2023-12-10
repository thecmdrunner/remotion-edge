import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";

export const metadata = {
  title: "Remotion Edge?",
  description: "Render videos on the browser using edge compute",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
