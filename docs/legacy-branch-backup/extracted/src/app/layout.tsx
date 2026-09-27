import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import './workspace.css';

export const metadata: Metadata = {
  title: { default: 'Vision Board', template: '%s | Vision Board' },
  description: 'A personal space to imagine, reflect, and grow.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <TooltipProvider delayDuration={350}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
