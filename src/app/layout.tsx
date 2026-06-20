import type { Metadata } from "next";
import { Rubik, Nunito } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import CustomCursor from "./components/CustomCursor";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pawly Premium Petshop | Evcil Hayvan Malzemeleri",
  description: "Kediniz, köpeğiniz, kuşunuz ve tüm küçük dostlarınız için premium kalitede mama, aksesuar, kafes ve sağlık ürünleri en uygun fiyatlarla Pawly'de.",
  keywords: "petshop, kedi maması, köpek maması, kedi kumu, akvaryum, kuş kafesi, evcil hayvan malzemeleri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${rubik.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-zinc-50 text-zinc-950 font-sans" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
        <AppProvider>
          <CustomCursor />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
