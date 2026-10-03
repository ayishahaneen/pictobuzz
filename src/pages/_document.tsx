import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Picto Buzz - The ultimate real-time multiplayer drawing and guessing party game!" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Comic+Neue:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-chalk-bg text-slate-100 min-h-screen selection:bg-amber-400 selection:text-slate-950">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
