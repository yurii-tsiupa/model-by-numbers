export type UserPlan = "free";

export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
};