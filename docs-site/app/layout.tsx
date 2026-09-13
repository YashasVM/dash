import { Provider } from '@/components/provider';
import Script from 'next/script';
import './global.css';

export const metadata = {
  metadataBase: new URL('https://yash0.in'),
  title: {
    default: 'yashas / docs',
    template: '%s · yashas / docs',
  },
  description: 'Practical notes behind yashas\' self-hosted, open-source tools.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
      <Script src="/analytics.js" strategy="lazyOnload" />
    </html>
  );
}
