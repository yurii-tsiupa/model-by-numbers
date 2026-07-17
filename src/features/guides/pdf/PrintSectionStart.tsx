import { View } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

import { PRINT_SECTION_FIRST_BLOCK_POINTS } from "./printPageConstants";

type PrintSectionStartProps = Omit<ComponentProps<typeof View>, "children" | "minPresenceAhead"> & {
  children: ReactNode;
  firstBlockHeight?: number;
};

export function PrintSectionStart({children, firstBlockHeight = PRINT_SECTION_FIRST_BLOCK_POINTS, ...props}: PrintSectionStartProps) {
  return <View {...props} minPresenceAhead={firstBlockHeight}>{children}</View>;
}
