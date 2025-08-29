export const metadata = {
  title: 'Todo App',
  description: 'Modern Todo App to manage your tasks daily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
