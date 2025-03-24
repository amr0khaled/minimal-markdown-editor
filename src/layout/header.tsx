import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useLayoutEffect, useState } from 'react'
import { FaRegSun, FaRegMoon } from 'react-icons/fa'
import { IoMdMenu } from 'react-icons/io'
import '@/style/layout/header.css'


export default function Header() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [currentWidth, setWidth] = useState<number>(0)
  const navBarContent = [
    {
      href: '#about',
      child: 'About'
    },
    {
      href: '#contact',
      child: 'Contact'
    },
  ]


  useLayoutEffect(() => {
    const html = document.documentElement
    const matches = window.matchMedia("(prefers-color-scheme: dark)").matches
    html.classList.toggle(
      'dark',
      theme === 'dark' && localStorage.theme === "dark" || (!("theme" in localStorage) && matches),
    )
    localStorage.theme = matches ? 'dark' : 'light';

  })
  useLayoutEffect(() => {
    setWidth(window.innerWidth)
  }, [currentWidth])
  return (
    <header className='header'>
      <nav className='header-container'>
        <span className='logo'>Label</span>
        {
          currentWidth > 430
            ? (
              <NavigationMenu className='navbar'>
                {navBarContent.map((e, i) => <NavigationMenuLink href={e.href} className='navbar-item' key={i}>{e.child}</NavigationMenuLink>
                )}
                <NavigationMenuItem asChild>
                  <Button variant="outline" size='icon' className='theme-changer' onClick={() => setTheme(e => e === 'dark' ? 'light' : "dark")}>
                    {
                      theme === 'dark'
                        ? <FaRegSun />
                        : <FaRegMoon />
                    }
                  </Button>
                </NavigationMenuItem>
              </NavigationMenu>
            )
            : (
              <div className='flex gap-x-3'>
                <Button variant="outline" size='icon' className='theme-changer' onClick={() => setTheme(e => e === 'dark' ? 'light' : "dark")}>
                  {
                    theme === 'dark'
                      ? <FaRegSun />
                      : <FaRegMoon />
                  }
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size={'icon'} className='p-0'>
                      <IoMdMenu className='size-[24px]' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='dropdown-menu'>
                    {navBarContent.map((e, i) =>
                      <DropdownMenuItem key={i}>
                        {e.child}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
        }
      </nav>
    </header>
  )

}
