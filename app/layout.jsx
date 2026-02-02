import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
    title: 'MOURNBIT | Trading Intelligence',
    description: 'Real-time cryptocurrency trading intelligence dashboard.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-text min-h-screen antialiased selection:bg-primary selection:text-black`}>
                {children}
            </body>
        </html>
    );
}
