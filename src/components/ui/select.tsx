import * as React from "react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-amber-50 disabled:opacity-70",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
