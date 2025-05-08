
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Map, LifeBuoy } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-purple-700/30"
    whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(128, 90, 213, 0.5)" }}
  >
    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-purple-300">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

const HomePage = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center py-10">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-12"
      >
        <LifeBuoy className="h-24 w-24 text-primary mx-auto mb-4 animate-pulse" />
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Bienvenido a <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">SafePath</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
          Tu compañero de confianza en el camino. Conéctate, comparte y mantente seguro.
        </p>
        <div className="space-x-4">
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg" asChild>
            <Link to="/register">Únete Ahora</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-3 text-lg" asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <FeatureCard 
          icon={<Map className="w-6 h-6" />}
          title="Ubicación Compartida"
          description="Comparte tu ubicación de forma segura con familiares y amigos."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6" />}
          title="Alertas de Seguridad"
          description="Reporta rutas inseguras y recibe alertas para mantenerte informado."
        />
        <FeatureCard 
          icon={<Users className="w-6 h-6" />}
          title="Comunidad de Apoyo"
          description="Conéctate con otros migrantes, comparte experiencias y encuentra apoyo."
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
        className="mt-16 p-8 bg-slate-800/60 rounded-xl shadow-2xl border border-purple-700/40 max-w-4xl w-full backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold mb-4 text-purple-300">Nuestra Misión</h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          En SafePath, estamos dedicados a proporcionar herramientas que mejoren la seguridad y conexión de las personas migrantes. Creemos en el poder de la comunidad y la tecnología para crear un mundo más seguro y solidario para todos.
        </p>
      </motion.div>
    </div>
  );
};

export default HomePage;
  