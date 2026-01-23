import { AppLayout } from '@/components/AppLayout';

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
