
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error de Registro",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Error de Registro",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password, fullName);
      toast({
        title: "Registro Exitoso",
        description: `¡Bienvenido a SafePath, ${fullName || email}! Revisa tu correo para confirmar tu cuenta.`,
      });
      navigate('/dashboard'); 
    } catch (error) {
      toast({
        title: "Error de Registro",
        description: error.message || "Hubo un problema al registrar tu cuenta. Por favor, inténtalo de nuevo.",
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
            <UserPlus className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-3xl font-bold text-purple-300">Crear Cuenta</CardTitle>
            <CardDescription className="text-gray-400">Únete a la comunidad SafePath.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName_register" className="text-gray-300">Nombre Completo (Opcional)</Label>
                <Input
                  id="fullName_register"
                  type="text"
                  placeholder="Tu Nombre Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_register" className="text-gray-300">Correo Electrónico</Label>
                <Input
                  id="email_register"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_register" className="text-gray-300">Contraseña</Label>
                <Input
                  id="password_register"
                  type="password"
                  placeholder="•••••••• (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-3" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 text-sm">
            <p className="text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-purple-400 hover:underline hover:text-pink-500">
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
  