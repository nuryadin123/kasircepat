import { ThemeToggle } from "./theme-toggle"
import { UserNav } from "./user-nav"
import { MobileNav } from "./mobile-nav"

type HeaderProps = {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-8 border-b">
        <div className="flex items-center gap-4 w-full">
          <MobileNav />
          <h1 className="text-lg sm:text-xl font-bold font-headline tracking-tight">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <ThemeToggle />
           <UserNav />
        </div>
      </div>
    </header>
  )
}
