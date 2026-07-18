"use client";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { auth } from "@/lib/firebase/client";
import {
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  signInWithGoogle,
  signOutUser,
} from "@/lib/firebase/auth";
import { getUserProfile, updateUserDisplayName } from "@/features/auth/services/user.service";
import type { UserProfile } from "@/features/auth/types/UserProfile";
import { getUserDisplayName } from "@/features/auth/lib/displayName";

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  profile: UserProfile | null;
  displayName: string;
  signIn: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (input: {displayName:string;email:string;password:string}) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateDisplayName: (displayName:string)=>Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile,setProfile]=useState<UserProfile|null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        setProfile(currentUser?await getUserProfile(currentUser.uid).catch(()=>null):null);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to restore authentication state:", error);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      profile,
      displayName:getUserDisplayName({profileDisplayName:profile?.displayName,authDisplayName:user?.displayName,fallback:""}),
      signIn: async () => {
        const credential=await signInWithGoogle();
        setProfile(await getUserProfile(credential.user.uid));
      },
      loginWithEmail: async (email, password) => {
        await loginWithEmail(email, password);
      },
      registerWithEmail: async (input) => {
        const credential=await registerWithEmail(input);
        setUser(credential.user);
        setProfile(await getUserProfile(credential.user.uid));
      },
      sendPasswordReset: async (email) => {
        await sendPasswordReset(email);
      },
      updateDisplayName:async(displayName)=>{if(!user)throw new Error("Not authenticated");const next=await updateUserDisplayName(user,displayName);setUser(auth.currentUser);setProfile(next);},
      signOut: async () => {
        await signOutUser();
      },
    }),
    [user, isLoading,profile],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
