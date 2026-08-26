import { cn as mergeClassNames, createTV } from "tailwind-variants";

export const cn = mergeClassNames;
export const tv = createTV({ twMerge: true });
