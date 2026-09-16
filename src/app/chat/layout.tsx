
import { Toaster } from '@/components/ui/toaster';
import SalesNotification from '@/components/sales-notification';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster />
      <SalesNotification />
    </>
  );
}
