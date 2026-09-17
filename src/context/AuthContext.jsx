import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const DEMO_USERS = {
  owner: {
    id: "usr-owner-01",
    email: "owner@transportsolutions.com",
    full_name: "Vikramaditya Singhania",
    role: "owner",
    phone: "+91 98200 11223",
    assigned_driver_id: null
  },
  manager: {
    id: "usr-mgr-02",
    email: "fleet.manager@transportsolutions.com",
    full_name: "Amitabh Deshmukh",
    role: "manager",
    phone: "+91 98200 44556",
    assigned_driver_id: null
  },
  accountant: {
    id: "usr-acc-03",
    email: "accounts@transportsolutions.com",
    full_name: "Sunita Agarwal",
    role: "accountant",
    phone: "+91 98200 77889",
    assigned_driver_id: null
  },
  driver: {
    id: "usr-drv-04",
    email: "rajesh.kumar@fleet.com",
    full_name: "Rajesh Kumar (Driver)",
    role: "driver",
    phone: "+91 98765 43210",
    assigned_driver_id: "drv-201"
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem('tms_current_role') || 'owner';
    return DEMO_USERS[savedRole] || DEMO_USERS.owner;
  });
  const [loading, setLoading] = useState(false);
  const [realUser, setRealUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setRealUser(session.user);
        // fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setRealUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) setUser(profile);
      } else {
        setRealUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchDemoRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      localStorage.setItem('tms_current_role', roleKey);
      setUser(DEMO_USERS[roleKey]);
    }
  };

  const loginWithSupabase = async (email, password) => {
    if (!supabase) throw new Error("Supabase is not configured. Use demo login or set credentials.");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (supabase && realUser) {
      await supabase.auth.signOut();
    }
    setRealUser(null);
    setUser(DEMO_USERS.owner);
  };

  const value = {
    user,
    realUser,
    role: user.role,
    loading,
    switchDemoRole,
    loginWithSupabase,
    logout,
    isOwner: user.role === 'owner',
    isManager: user.role === 'manager' || user.role === 'owner',
    isAccountant: user.role === 'accountant' || user.role === 'owner',
    isDriver: user.role === 'driver',
    canManageFinancials: ['owner', 'accountant'].includes(user.role),
    canManageOps: ['owner', 'manager'].includes(user.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
