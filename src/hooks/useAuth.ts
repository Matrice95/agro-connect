import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonction pour mettre à jour la session
    const setData = (session: Session | null) => {
      setSession(session);
      setLoading(false);
    };

    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setData(session);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}