import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}








