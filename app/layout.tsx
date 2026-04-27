import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';

const figtree = Figtree({
subsets: ['latin'],
weight: ['300', '400', '500', '600', '700', '800', '900'],
display: 'swap',
});

export const metadata: Metadata = {
title: 'HITSTER',
description: 'El juego musical de timeline',
manifest: '/manifest.json',
appleWebApp: {
capable: true,
statusBarStyle: 'black-translucent',
title: 'HITSTER',
},
};

export const viewport: Viewport = {
themeColor: '#0d1117',
width: 'device-width',
initialScale: 1,
maximumScale: 1,
userScalable: false,
};

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return ( <html lang="es">
<body
className={figtree.className}
style={{
background: '#0d1117',
margin: 0,
}}
>
{children} </body></html>
);
}
