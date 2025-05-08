
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setLoading(false);
        return;
      }

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(userProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile on auth change:', profileError);
          } else {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Profile will be updated by onAuthStateChange
    return data;
  };

  const register = async (email, password, fullName = '', username = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username || email.split('@')[0] + Math.floor(Math.random() * 1000), // Default username
        }
      }
    });
    if (error) throw error;
    // Profile will be created by trigger and fetched by onAuthStateChange
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };


  const value = {
    user,
    session,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
  