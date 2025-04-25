import "./globals.css";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import AuthProvider from "@/components/auth/AuthProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { MicrophoneContextProvider } from "@/context/MicrophoneContextProvider";
import { DeepgramContextProvider } from "@/context/DeepgramContextProvider";
import StoreProvider from "./StoreProvider";

const openSans = Open_Sans({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "wiZe (myLampAI)",
  description: "We nurture, assess & match talent with premium opportunities.",
  url: "https://wize.co.in",
  metadataBase: new URL("https://wize.co.in"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "en-IN": "/en-IN",
    },
  },
  openGraph: {
    title: "wiZe (myLampAI) ",
    description: "We nurture, assess & match talent with premium opportunities.",
    url: "https://wize.co.in",
    siteName: "wiZe (myLampAI)",
    images: [
      {
        url: "https://wize.co.in/og.png", // Must be an absolute URL
        width: 800,
        height: 600,
      },
      {
        url: "https://wize.co.in/og-alt.png", // Must be an absolute URL
        width: 1800,
        height: 1600,
        alt: "My custom alt",
      },
    ],
    videos: [
      {
        url: "https://wize.co.in/video.mp4", // Must be an absolute URL
        width: 800,
        height: 600,
      },
    ],
    audio: [
      {
        url: "https://wize.co.in/audio.mp3", // Must be an absolute URL
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth focus:scroll-auto">
      <body className={`${openSans.className}`}>
        <StoreProvider>
          <AuthProvider><MicrophoneContextProvider>
            <DeepgramContextProvider>{children}</DeepgramContextProvider>
          </MicrophoneContextProvider></AuthProvider>
        </StoreProvider>
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
