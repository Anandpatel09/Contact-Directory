// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from 'react';

// import {
//   getAuth,
//   onAuthStateChanged,
//   FirebaseAuthTypes,
// } from '@react-native-firebase/auth';

// interface AuthContextType {
//   user: FirebaseAuthTypes.User | null;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(
//   undefined,
// );

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const auth = getAuth();

//     const unsubscribe = onAuthStateChanged(auth, currentUser => {
//       setUser(currentUser);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error('useAuth must be used inside AuthProvider');
//   }

//   return context;
// };

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

type AuthUser = ReturnType<typeof getAuth>['currentUser'];

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
