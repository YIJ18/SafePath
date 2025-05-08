
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, MapPinned, Users, UserCircle, LogOut, ShieldAlert, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx"


const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100">
      <header className="sticky top-0 z-40 w-full border-b border-purple-700/50 bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}>
              <LifeBuoy className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              SafePath
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user && (
              <>
                <Button variant="ghost" className="text-gray-300 hover:bg-purple-700/50 hover:text-white" asChild>
                  <Link to="/dashboard"><MapPinned className="mr-2 h-4 w-4" />Panel</Link>
                </Button>
                <Button variant="ghost" className="text-gray-300 hover:bg-purple-700/50 hover:text-white" asChild>
                  <Link to="/community"><Users className="mr-2 h-4 w-4" />Comunidad</Link>
                </Button>
              </>
            )}
          </nav>
          <div className="flex items-center space-x-3">
            {!user ? (
              <>
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white" asChild>
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${user.email}`} alt={user.email} />
                      <AvatarFallback>{user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-purple-700 text-gray-200" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">¡Hola!</p>
                      <p className="text-xs leading-none text-muted-foreground text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-purple-700/50" />
                  <DropdownMenuItem className="hover:bg-purple-700/50 focus:bg-purple-700/50" asChild>
                     <Link to="/profile"><UserCircle className="mr-2 h-4 w-4" />Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-purple-700/50 focus:bg-purple-700/50" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-purple-700/50 bg-slate-900/80 py-6 text-center text-sm text-gray-400">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} SafePath. Todos los derechos reservados.</p>
          <p className="mt-1">Ayudando a construir caminos más seguros.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
  