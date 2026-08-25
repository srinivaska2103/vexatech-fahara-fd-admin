import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Fahara Admin",
  description: "Fahara Admin Web Application & Management Suite",
  manifest: "/manifest.json",
  icons: {
    icon: "/Fahara Logo.jpeg",
    shortcut: "/Fahara Logo.jpeg",
    apple: "/Fahara Logo.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Fahara Logo.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/Fahara Logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/Fahara Logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased bg-fahara-background text-fahara-text">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
