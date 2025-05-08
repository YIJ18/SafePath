
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming you'll create this component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Users, ShieldQuestion, PlusCircle, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Simple Textarea component (create src/components/ui/textarea.jsx if it doesn't exist)
const TextareaPrimitive = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
TextareaPrimitive.displayName = "Textarea";
export { TextareaPrimitive as Textarea };


const CreateThreadForm = ({ onThreadCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Discusión General');
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear un hilo.", variant: "destructive" });
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "El título y el contenido son obligatorios.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from('forum_threads')
      .insert([{ user_id: user.id, title, content, category }])
      .select()
      .single();

    if (error) {
      toast({ title: "Error al crear hilo", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Hilo Creado", description: "Tu hilo ha sido publicado." });
      setTitle('');
      setContent('');
      setCategory('Discusión General');
      setIsOpen(false);
      if (onThreadCreated) onThreadCreated(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Hilo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-purple-700 text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Crear Nuevo Hilo de Discusión</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label htmlFor="threadTitle" className="block text-sm font-medium text-gray-300 mb-1">Título del Hilo</label>
            <Input id="threadTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Un título descriptivo para tu hilo" className="bg-slate-700 border-purple-600" />
          </div>
          <div>
            <label htmlFor="threadContent" className="block text-sm font-medium text-gray-300 mb-1">Contenido Principal</label>
            <Textarea id="threadContent" value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Escribe el contenido principal de tu hilo aquí..." className="bg-slate-700 border-purple-600" />
          </div>
          <div>
            <label htmlFor="threadCategory" className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
            <select id="threadCategory" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 rounded-md bg-slate-700 border-purple-600 text-gray-200">
              <option>Discusión General</option>
              <option>Consejos de Viaje</option>
              <option>Alertas Comunitarias</option>
              <option>Puntos de Ayuda</option>
              <option>Historias y Experiencias</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-purple-500 text-purple-400 hover:bg-purple-500/20">Cancelar</Button>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">Publicar Hilo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ForumThreadView = ({ thread, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    if (!thread) return;
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`*, author:user_id (profiles(username, full_name, avatar_url))`)
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: "Error al cargar posts", description: error.message, variant: "destructive" });
    } else {
      setPosts(data || []);
    }
  }, [thread, toast]);

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel(`forum_posts_thread_${thread?.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts', filter: `thread_id=eq.${thread?.id}` }, 
        payload => {
          console.log('Post change received!', payload);
          fetchPosts();
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [thread, fetchPosts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para publicar.", variant: "destructive" });
      return;
    }
    if (!newPostContent.trim()) {
      toast({ title: "Error", description: "El contenido no puede estar vacío.", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from('forum_posts')
      .insert([{ thread_id: thread.id, user_id: user.id, content: newPostContent }]);
    if (error) {
      toast({ title: "Error al publicar", description: error.message, variant: "destructive" });
    } else {
      setNewPostContent('');
      // Realtime will update posts
    }
  };

  if (!thread) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button onClick={onBack} variant="outline" className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500/20">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a los Hilos
      </Button>
      <Card className="bg-slate-700/50 border-purple-600/70">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-300">{thread.title}</CardTitle>
          <CardDescription className="text-gray-400">
            Por: {thread.author?.profiles?.username || thread.author?.profiles?.full_name || 'Usuario Desconocido'} - {format(new Date(thread.created_at), "Pp", { locale: es })} <br/>
            Categoría: {thread.category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 whitespace-pre-wrap">{thread.content}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl text-purple-300 font-semibold">Respuestas:</h3>
        {posts.map(post => (
          <Card key={post.id} className="bg-slate-700/30 border-purple-600/50">
            <CardHeader className="pb-2">
              <p className="text-sm text-gray-400">
                {post.author?.profiles?.username || post.author?.profiles?.full_name || 'Usuario Desconocido'} - {format(new Date(post.created_at), "Pp", { locale: es })}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && <p className="text-gray-400">No hay respuestas aún. ¡Sé el primero!</p>}
      </div>

      {user && !thread.locked && (
        <form onSubmit={handlePostSubmit} className="space-y-3 pt-4">
          <Textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Escribe tu respuesta..." rows={4} className="bg-slate-700 border-purple-600" />
          <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
            <Send className="mr-2 h-4 w-4" /> Enviar Respuesta
          </Button>
        </form>
      )}
      {thread.locked && <p className="text-yellow-400 text-center py-4">Este hilo está cerrado y no admite nuevas respuestas.</p>}
    </motion.div>
  );
};


const CommunityPage = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [resources, setResources] = useState([]);
  const { toast } = useToast();

  const fetchThreads = useCallback(async () => {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`*, author:user_id (profiles(username, full_name, avatar_url))`)
      .order('sticky', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) {
      toast({ title: "Error al cargar hilos", description: error.message, variant: "destructive" });
    } else {
      setThreads(data || []);
    }
  }, [toast]);
  
  const fetchResources = useCallback(async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error al cargar recursos", description: error.message, variant: "destructive" });
    } else {
      setResources(data || []);
    }
  }, [toast]);

  useEffect(() => {
    fetchThreads();
    fetchResources();

    const threadsChannel = supabase
      .channel('forum_threads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_threads' }, 
        payload => {
          console.log('Thread change received!', payload);
          fetchThreads();
          if (selectedThread && payload.eventType === 'UPDATE' && payload.new.id === selectedThread.id) {
            setSelectedThread(s => ({...s, ...payload.new})); // Update selected thread if it changed
          }
        }
      )
      .subscribe();
      
    const resourcesChannel = supabase
      .channel('resources_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, 
        payload => {
          console.log('Resource change received!', payload);
          fetchResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(threadsChannel);
      supabase.removeChannel(resourcesChannel);
    };
  }, [fetchThreads, fetchResources]);

  const handleThreadCreated = (newThread) => {
    // fetchThreads will be called by realtime, or uncomment below for immediate optimistic update
    // setThreads(prev => [newThread, ...prev]); 
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="space-y-8"
    >
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
          Comunidad SafePath
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Conéctate, comparte y apóyate. Juntos somos más fuertes.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {selectedThread ? (
          <motion.div key="thread-view" variants={cardVariants}>
            <ForumThreadView thread={selectedThread} onBack={() => setSelectedThread(null)} />
          </motion.div>
        ) : (
          <motion.div key="thread-list" variants={cardVariants} className="space-y-8">
            <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-300 flex items-center"><Users className="mr-3 h-7 w-7 text-primary" />Foros de Discusión</CardTitle>
                <CardDescription className="text-gray-400">
                  Participa en conversaciones, comparte experiencias y obtén consejos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CreateThreadForm onThreadCreated={handleThreadCreated} />
                {threads.length === 0 && <p className="text-gray-400 text-center py-4">No hay hilos de discusión aún. ¡Crea el primero!</p>}
                {threads.map(thread => (
                  <div key={thread.id} className="p-4 border border-purple-600/50 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => setSelectedThread(thread)}>
                    <h4 className="font-semibold text-lg text-purple-300 mb-1">{thread.title} {thread.sticky && <span className="text-xs bg-yellow-500 text-black px-1 py-0.5 rounded ml-2">FIJADO</span>} {thread.locked && <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded ml-2">CERRADO</span>}</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Por: {thread.author?.profiles?.username || thread.author?.profiles?.full_name || 'Usuario Desconocido'} - {format(new Date(thread.created_at), "Pp", { locale: es })}
                    </p>
                    <p className="text-gray-300 truncate">{thread.content?.substring(0,150)}...</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-300 flex items-center"><MessageSquare className="mr-3 h-7 w-7 text-primary" />Mensajería Privada</CardTitle>
                <CardDescription className="text-gray-400">
                  Comunícate de forma segura con otros usuarios.
                  <br />
                  <strong className="text-yellow-400">(Funcionalidad básica implementada. No es chat en tiempo real.)</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center py-4">La mensajería privada permite enviar y recibir mensajes. Para una experiencia de chat en tiempo real completa, se requerirían WebSockets.</p>
                <Button disabled className="w-full">Abrir Mensajes (Próximamente con más funciones)</Button>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-300 flex items-center"><ShieldQuestion className="mr-3 h-7 w-7 text-primary" />Recursos y Guías</CardTitle>
                <CardDescription className="text-gray-400">
                  Información útil y guías de seguridad.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                  {resources.map(resource => (
                    <ResourceItem key={resource.id} resource={resource} />
                  ))}
                  {resources.length === 0 && <p className="text-gray-400">No hay recursos disponibles en este momento.</p>}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ResourceItem = ({ resource }) => (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 border border-purple-600/50 rounded-md">
        <div>
            <h5 className="text-gray-200 font-semibold">{resource.title}</h5>
            {resource.description && <p className="text-sm text-gray-400">{resource.description}</p>}
        </div>
        {resource.url && (
            <Button variant="link" asChild className="text-purple-400 hover:text-pink-500">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">Ver más</a>
            </Button>
        )}
    </div>
);

export default CommunityPage;
  