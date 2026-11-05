import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Grab2GO Admin",
  description: "Grab2GO Admin Web Application & Management Suite",
  manifest: "/manifest.json",
  icons: {
    icon: "/grab-it-logo.png",
    shortcut: "/grab-it-logo.png",
    apple: "/grab-it-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/grab-it-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/grab-it-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/grab-it-logo.png" />
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
