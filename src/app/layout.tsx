import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const APP_NAME = "A.I. Astrologer";
const APP_DESCRIPTION = "Unlock the secrets of the cosmos. Get personalized astrological readings based on B.V. Raman Ayanamsa and chat with your AI-powered guide to the stars for follow-up questions.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-astrologer.com"), // Replace with your actual domain
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["astrology", "ai", "horoscope", "predictions", "zodiac", "birth chart", "B.V. Raman Ayanamsa"],
  applicationName: APP_NAME,
  authors: [{ name: "Firebase Studio" }],
  creator: "Firebase Studio",
  publisher: "Firebase Studio",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-astrologer.com", // Replace with your actual domain
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: "/og-image.png", // Replace with your actual Open Graph image URL
        width: 1200,
        height: 630,
        alt: `A preview of ${APP_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.png"], // Replace with your actual Twitter image URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn("font-sans antialiased h-full")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
