import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'admin' | 'hse_inspector' | 'site_director' | 'site_manager' | 'auditor';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar: string;
  companyId: string;
  isActive: boolean;
  lastLogin: string;
}

export const MOCK_USERS: User[] = [
  { id: '1', role: 'hse_inspector', name: 'Alex Johnson', email: 'alex.j@sitesafe.local', avatar: 'https://i.pravatar.cc/150?u=alex', companyId: 'COMP-1', isActive: true, lastLogin: new Date().toISOString() },
  { id: '2', role: 'site_director', name: 'Marie Dubois', email: 'marie.d@sitesafe.local', avatar: 'https://i.pravatar.cc/150?u=marie', companyId: 'COMP-1', isActive: true, lastLogin: new Date().toISOString() },
  { id: '3', role: 'site_manager', name: 'Paul Bernard', email: 'paul.b@sitesafe.local', avatar: 'https://i.pravatar.cc/150?u=paul', companyId: 'COMP-2', isActive: true, lastLogin: new Date().toISOString() },
  { id: '4', role: 'auditor', name: 'Sophie Martin', email: 'sophie.m@sitesafe.local', avatar: 'https://i.pravatar.cc/150?u=sophie', companyId: 'EXT-AUDIT', isActive: true, lastLogin: new Date().toISOString() },
  { id: '5', role: 'admin', name: 'Admin Système', email: 'admin@sitesafe.local', avatar: 'https://i.pravatar.cc/150?u=admin', companyId: 'COMP-1', isActive: true, lastLogin: new Date().toISOString() },
];

interface AuthContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Par défaut, on se connecte en tant qu'Inspecteur HSE (l'utilisateur cible d'origine)
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  const switchUser = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
