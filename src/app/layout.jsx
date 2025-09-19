import "./globals.css";

export const metadata = {
  title: "Reservasi Online",
  description: "Capstone Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
