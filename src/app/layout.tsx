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
  title: "Zuzu Pet Co. Premium Petshop | Evcil Hayvan Malzemeleri",
  description: "Kediniz, köpeğiniz ve tüm küçük dostlarınız için premium kalitede mama, aksesuar, kafes ve sağlık ürünleri en uygun fiyatlarla Zuzu Pet Co.'da.",
  keywords: "zuzu pet co, petshop, kedi maması, köpek maması, kedi kumu, akvaryum, kuş kafesi, evcil hayvan malzemeleri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-body bg-zinc-50 text-zinc-950 font-sans" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
        <AppProvider>
          <CustomCursor />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

