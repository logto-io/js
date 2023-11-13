import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Logto Next Sample',
    template: '%s | Logto Next Sample',
  },
};

const RootLayout = ({ children }: { readonly children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
