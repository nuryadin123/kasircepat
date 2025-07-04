"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "firebase/auth"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth } from "@/lib/firebase"
import type { User } from "@/types"

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Construct user object from localStorage
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const uid = localStorage.getItem('userUID');

    if (role && name && email && uid) {
      setUser({
        id: uid,
        name: name,
        email: email,
        role: role as User['role'],
      });
    } else {
      // If essential info is missing, and we're not on the auth page,
      // redirect to re-authenticate. This is a fallback.
      // The onAuthStateChanged listener on pages is the primary mechanism.
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
         router.push('/');
      }
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      // Clear all user-related data
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userUID');
      router.push('/');
      // Use a brief timeout to allow router to push before refresh
      setTimeout(() => router.refresh(), 100);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }
  
  if (!user) {
    return null; // Don't render anything if user is not loaded
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === 'admin' && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">Pengaturan</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleLogout}>
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
