import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'AprendaInglesGratis - Aprenda Ingles de Forma Divertida',
  description: 'Plataforma gratuita para aprender ingles com gamificacao, IA e professores nativos.',
  keywords: ['ingles', 'aprender', 'gratis', 'gamificacao', 'conversacao'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
