export const ONBOARDING_TARGETS={
  projectPalette:"project-palette",
  modelViewer:"model-viewer",
  references:"references",
  targetingMethod:"targeting-method",
  paintingSteps:"painting-steps",
  addStep:"add-step",
  stepEditor:"step-editor",
  detailEditor:"detail-editor",
  markerToolbar:"marker-toolbar",
  regionToolbar:"region-toolbar",
  guideAction:"guide-action",
  helpAction:"help-action",
} as const;

export type OnboardingTarget=typeof ONBOARDING_TARGETS[keyof typeof ONBOARDING_TARGETS];
export const onboardingTargetSelector=(target:OnboardingTarget)=>`[data-onboarding-target="${target}"]`;
