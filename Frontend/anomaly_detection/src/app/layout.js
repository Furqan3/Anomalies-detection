
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children
}) {
  return (
    
    <html lang="en">

      <body className={inter.className}>
        
      <header ><div className="flex flex-col justify-center items-center  space-y-2 bg-gray-200">
    <h1 className="text-4xl font-extrabold  text-center text-orange-600  p-4 rounded-lg">
      SYSTEM ANOMALIES DETECTION
    </h1>
        </div>
      </header>
        {children}</body>
     
    </html>
  );
}
