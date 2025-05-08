
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Por favor, completa todos los campos.");
      }
      await login(email, password);
      toast({
        title: "Inicio de Sesión Exitoso",
        description: `¡Bienvenido de nuevo, ${email}!`,
        variant: "default",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error al Iniciar Sesión",
        description: error.message || "Hubo un problema al iniciar sesión. Verifica tus credenciales.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-slate-800/70 border-purple-700/50 shadow-2xl backdrop-blur-lg">
          <CardHeader className="text-center">
            <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-3xl font-bold text-purple-300">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-400">Accede a tu cuenta SafePath.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-3" disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 text-sm">
            <p className="text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-purple-400 hover:underline hover:text-pink-500">
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
  