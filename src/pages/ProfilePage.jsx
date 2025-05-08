
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserCog, Bell, ShieldCheck, Share2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth(); // Assuming 'updateUser' could be part of auth context later
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [contactEmail, setContactEmail] = useState(user?.email || ''); // Email used for login for now
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update user data.
    // For now, we'll just show a toast and simulate update.
    // You could potentially update localStorage if you wanted persistence here.
    // const updatedUserData = { ...user, displayName, emergencyContact };
    // updateUser(updatedUserData); // This would be from AuthContext if implemented
    
    toast({
      title: "Perfil Actualizado (Simulado)",
      description: "Tu información de perfil ha sido guardada.",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
          Tu Perfil
        </h1>
        <p className="text-xl text-gray-300">Gestiona tu información y preferencias.</p>
      </header>

      <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
        <CardHeader className="items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
            <AvatarImage src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${user.email}`} alt={user.email} />
            <AvatarFallback className="text-3xl">{user.email ? user.email.substring(0,2).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl text-purple-300">{displayName || user.email}</CardTitle>
          <CardDescription className="text-gray-400">Miembro de SafePath</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-300">Nombre a Mostrar</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Tu nombre o apodo"
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-gray-300">Correo de Contacto</Label>
                <Input 
                  id="contactEmail" 
                  type="email" 
                  value={contactEmail} 
                  disabled 
                  className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500 opacity-70 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-gray-300">Contacto de Emergencia (Teléfono o Email)</Label>
              <Input 
                id="emergencyContact" 
                value={emergencyContact} 
                onChange={(e) => setEmergencyContact(e.target.value)} 
                placeholder="Ej: +1234567890 o familiar@ejemplo.com"
                className="bg-slate-700/50 border-purple-600 text-gray-200 placeholder-gray-500 focus:ring-pink-500"
              />
               <p className="text-xs text-gray-500">Este contacto sería notificado en caso de emergencia (funcionalidad simulada).</p>
            </div>
            <Button type="submit" className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <UserCog className="mr-2 h-4 w-4"/> Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-purple-300 flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Preferencias de Notificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-400 text-sm">Gestiona cómo y cuándo recibes alertas. (Funcionalidad simulada)</p>
            <Button variant="outline" className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/20">Configurar Notificaciones</Button>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-purple-300 flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/> Seguridad y Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-400 text-sm">Ajusta la configuración de privacidad de tu cuenta. (Funcionalidad simulada)</p>
            <Button variant="outline" className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/20">Ajustes de Privacidad</Button>
          </CardContent>
        </Card>
      </div>
       <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-purple-300 flex items-center"><Share2 className="mr-2 h-5 w-5 text-primary"/> Historial de Ubicaciones Compartidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-400 text-sm">Revisa y gestiona tu historial de ubicaciones compartidas. (Funcionalidad simulada, requiere backend)</p>
            <Button variant="outline" className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/20">Ver Historial</Button>
          </CardContent>
        </Card>
    </motion.div>
  );
};

export default ProfilePage;
  