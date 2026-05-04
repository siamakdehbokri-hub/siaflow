import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function useThemeState() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  useEffect(() => {
    const stored = localStorage.getItem("app-theme") as "light" | "dark" | "system" | null;
    setTheme(stored || "dark");
  }, []);
  return theme;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeState();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      // Sit above the fixed BottomNav (72px) + iOS safe area, never under the header.
      offset="calc(var(--bottom-nav-height, 72px) + env(safe-area-inset-bottom, 0px) + 16px)"
      dir="rtl"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
