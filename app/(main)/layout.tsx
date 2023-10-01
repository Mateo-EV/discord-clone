import { NavigationSidebar } from "@/components/navigation/NavigationSidebar"
import { ModalProvider } from "@/components/providers/ModalProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { TooltipProvider } from "@/components/ui/tooltip"

export default async function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={50}>
        <ModalProvider />
        <div className="h-full">
          <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
            <NavigationSidebar />
          </div>
          <main className="md:pl-[72px] h-full">{children}</main>
        </div>
      </TooltipProvider>
    </QueryProvider>
  )
}
