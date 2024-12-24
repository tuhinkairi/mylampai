import "./globals.css";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import AuthProvider from "@/components/auth/AuthProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const openSans = Open_Sans({ subsets: ["latin"], display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth focus:scroll-auto">
      <body className={`${openSans.className}`}>
        <AuthProvider>{children}</AuthProvider>
        <GoogleAnalytics gaId="G-3TPKSH7MPS" />
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
          `}
        </Script>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
