'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Classes', href: '/dashboard/classes', icon: '📚' },
  { name: 'Assignments', href: '/dashboard/assignments', icon: '📝' },
  { name: 'Reports', href: '/dashboard/reports', icon: '📊' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0F0D15]">
      {/* Header */}
      <header className="bg-white/5 border-b border-white/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white p-2 hover:bg-white/10 rounded-md"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-xl font-bold text-white">
                  ✋ <span className="text-purple-500">Hand</span>Mark
                </h1>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-gray-400">
                {user?.email}
              </div>
              <img
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=8B5CF6&color=fff`}
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
              <Button onClick={signOut} variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16">
          <div className="flex flex-col gap-y-5 overflow-y-auto border-r border-white/10 bg-white/5 px-6 py-4">
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-2">
                {navigation.map((item) => {
                  const isActive = pathname?.startsWith(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors',
                          isActive
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 pt-16">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 pt-16 bg-[#1A1825] border-r border-white/10">
              <div className="flex flex-col gap-y-5 overflow-y-auto px-6 py-4">
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    {navigation.map((item) => {
                      const isActive = pathname?.startsWith(item.href)
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors',
                              isActive
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            )}
                          >
                            <span className="text-xl">{item.icon}</span>
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
                <Button onClick={signOut} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="lg:pl-64 flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
