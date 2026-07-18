"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { ModelsLibrary } from "@/features/models/components/ModelsLibrary";

export default function ProfileModelsPage() {
  const { user } = useAuth();
  return user ? <ModelsLibrary userId={user.uid} embedded/> : null;
}
