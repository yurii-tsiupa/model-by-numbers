import {ONBOARDING_TARGETS} from "../constants/onboardingTargets";
import type {OnboardingTour} from "../types/onboarding.types";
import {useModelEditorStore} from "@/features/model-editor/store/modelEditorStore";

export const SIMPLE_MODE_TOUR:OnboardingTour={
  id:"simple-mode-editor",
  version:1,
  steps:[
    {id:"palette",targetId:ONBOARDING_TARGETS.projectPalette,titleKey:"onboarding.tour.palette.title",descriptionKey:"onboarding.tour.palette.description",placement:"right",waitForTarget:true},
    {id:"viewer",targetId:ONBOARDING_TARGETS.modelViewer,titleKey:"onboarding.tour.viewer.title",descriptionKey:"onboarding.tour.viewer.description",placement:"bottom",waitForTarget:true},
    {id:"references",targetId:ONBOARDING_TARGETS.references,titleKey:"onboarding.tour.references.title",descriptionKey:"onboarding.tour.references.description",placement:"left",waitForTarget:true},
    {id:"targeting",targetId:ONBOARDING_TARGETS.targetingMethod,titleKey:"onboarding.tour.targeting.title",descriptionKey:"onboarding.tour.targeting.description",placement:"left",waitForTarget:true,canContinue:()=>Boolean(useModelEditorStore.getState().simpleTargetMode),subscribeToContinue:listener=>useModelEditorStore.subscribe(()=>listener()),blockedMessageKey:"onboarding.tour.targeting.required",nextLabelKey:"onboarding.continue"},
    {id:"steps",targetId:ONBOARDING_TARGETS.paintingSteps,titleKey:"onboarding.tour.steps.title",descriptionKey:"onboarding.tour.steps.description",placement:"left",waitForTarget:true},
    {id:"add-step",targetId:ONBOARDING_TARGETS.addStep,titleKey:"onboarding.tour.addStep.title",descriptionKey:"onboarding.tour.addStep.description",placement:"left",waitForTarget:true},
    {id:"guide",targetId:ONBOARDING_TARGETS.guideAction,titleKey:"onboarding.tour.guide.title",descriptionKey:"onboarding.tour.guide.description",placement:"bottom",waitForTarget:true},
  ],
};

export const ONBOARDING_HINT_VERSION=1;
