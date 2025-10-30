import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leftNode?: React.ReactNode; // e.g. back button
  rightNode?: React.ReactNode; // custom action buttons (ThemeToggle will be shown by default)
  hideThemeToggle?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, leftNode, rightNode, hideThemeToggle }) => {
  return (
    <div className="glass border-b border-border/50 sticky top-0 z-10 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-3">
            {leftNode && (
              <div className="flex-shrink-0 mr-1">
                {leftNode}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2 flex-shrink-0 items-center">
            {!hideThemeToggle && <ThemeToggle />}
            {rightNode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
