export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-2xl mt-4">Page Not Found</p>
        <a href="/" className="mt-6 inline-block text-blue-600 hover:underline">
          Go back home
        </a>
      </div>
    </div>
  )
}
