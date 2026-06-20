import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import CustomCursor from "./components/CustomCursor";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zuzu Pet Co. Bornova İzmir | Premium Petshop & Evcil Hayvan Malzemeleri",
  description: "İzmir Bornova'daki premium petshop mağazamızda kediniz, köpeğiniz ve tüm patili dostlarınız için kaliteli mama, aksesuar, kafes ve sağlık ürünleri Zuzu Pet Co.'da.",
  keywords: "zuzu pet co, petshop izmir, bornova petshop, izmir pet shop, kedi maması izmir, köpek maması bornova, kedi kumu bornova, evcil hayvan malzemeleri izmir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // LocalBusiness JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    "name": "Zuzu Pet Co. Bornova İzmir",
    "image": "https://zuzupet.co/icon.svg",
    "@id": "https://zuzupet.co/#store",
    "url": "https://zuzupet.co",
    "telephone": "+90 530 470 05 43",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "İnönü mah. Hürriyet cad. No 236/A",
      "addressLocality": "Bornova",
      "addressRegion": "İzmir",
      "postalCode": "35030",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "38.4631",
      "longitude": "27.2163"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "20:00"
    }
  };

  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-body bg-zinc-50 text-zinc-950 font-sans" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
        <AppProvider>
          <CustomCursor />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
