import { APP_NAME } from "@/lib/brand";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; dot: string; text: string }> = {
  sm: { box: "w-5 h-5",  dot: "w-1.5 h-1.5", text: "text-[13px]" },
  md: { box: "w-6 h-6",  dot: "w-2 h-2",     text: "text-[14px]" },
  lg: { box: "w-7 h-7",  dot: "w-2.5 h-2.5", text: "text-[15px]" },
};

interface AppLogoProps {
  size?: Size;
  textClassName?: string;
  className?: string;
}

export default function AppLogo({ size = "md", textClassName, className }: AppLogoProps) {
  const s = sizeMap[size];
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <span
        className={`${s.box} rounded-md bg-[#111] flex items-center justify-center shrink-0`}
      >
        <span className={`${s.dot} rounded-full bg-[#4ADE80]`} />
      </span>
      <span className={`font-medium text-ink leading-tight ${s.text} ${textClassName ?? ""}`}>
        {APP_NAME}
      </span>
    </span>
  );
}
