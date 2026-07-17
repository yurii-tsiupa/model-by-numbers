import { View } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

type PrintKeepTogetherProps = Omit<ComponentProps<typeof View>, "children" | "wrap"> & {
  children: ReactNode;
};

export function PrintKeepTogether({children, ...props}: PrintKeepTogetherProps) {
  return <View {...props} wrap={false}>{children}</View>;
}
