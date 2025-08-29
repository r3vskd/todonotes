export const metadata = {
  title: 'Gestor de Tareas',
  description: 'Aplicación moderna para gestionar tus tareas diarias',
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
        <link rel="icon" href="/favico.ico"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
