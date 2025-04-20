import { Toaster } from "./components/ui/toaster"
import { PackageManager } from "./pages/PackageManager"
import { PackageProvider } from "./context/PackageContext"

export function App() {
  return (
    <PackageProvider>
      <div className="font-sans bg-gray-50 min-h-screen">
        <PackageManager />
        <Toaster />
      </div>
    </PackageProvider>
  )
}
