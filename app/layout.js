import "./globals.css";
import { Montserrat, Quicksand } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "@/context/Cartcontext";


const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata = {
  title: "KwikMart",
  description: "Fresh groceries, delivered to your pickup point.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${quicksand.variable}`}>
      <body className="min-h-screen font-body">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
