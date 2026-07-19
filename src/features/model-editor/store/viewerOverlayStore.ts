import { create } from "zustand";

type ViewerOverlayState = {
  manualDetailPinSuppressions: number;
  beginManualDetailPinSuppression: () => void;
  endManualDetailPinSuppression: () => void;
};

export const useViewerOverlayStore = create<ViewerOverlayState>((set) => ({
  manualDetailPinSuppressions: 0,
  beginManualDetailPinSuppression: () => set((state) => ({ manualDetailPinSuppressions: state.manualDetailPinSuppressions + 1 })),
  endManualDetailPinSuppression: () => set((state) => ({ manualDetailPinSuppressions: Math.max(0, state.manualDetailPinSuppressions - 1) })),
}));

export function suppressManualDetailPins(): () => void {
  useViewerOverlayStore.getState().beginManualDetailPinSuppression();
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    useViewerOverlayStore.getState().endManualDetailPinSuppression();
  };
}
