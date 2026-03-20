/* eslint-disable react-refresh/only-export-components */
import type { HTMLAttributes, ReactNode } from "react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const panelSurfaceClass =
  "panel-surface h-full w-full overflow-auto px-5 py-4 sm:px-7 sm:py-5";

export const centeredPanelClass =
  `${panelSurfaceClass}`;

export const sectionCardClass =
  "panel-section rounded-[28px] px-4 py-4 sm:px-5 sm:py-5";

export const mutedSectionCardClass =
  "panel-section-muted rounded-[22px] px-4 py-3";

export const workstationPanelCardClass =
  "panel-section-muted h-full rounded-[28px] px-4 py-4";

export const workstationInsetCardClass =
  "panel-section-muted rounded-[22px] px-4 py-3";

export const workstationShellClass =
  "rounded-t-[28px]";

export const workstationFieldLabelClass =
  "text-sm font-medium text-slate-700 dark:text-slate-200";

export const workstationInputClass =
  "min-h-11 w-full rounded-[22px] border border-slate-200/80 bg-white/82 px-3.5 py-2 text-sm text-slate-800 outline-none shadow-[var(--shadow-control)] transition-all duration-200 hover:border-slate-300 hover:bg-white/90 focus:border-blue-400 focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700/80 dark:bg-slate-900/72 dark:text-slate-100 dark:hover:border-slate-600";

export const workstationChoiceRowClass =
  "rounded-[22px] border border-slate-200/80 bg-white/60 px-3.5 py-3 shadow-[var(--shadow-control)] transition-all duration-200 dark:border-slate-700/80 dark:bg-slate-900/55";

export const workstationChoiceRowActiveClass =
  "border-blue-400 bg-white/92 dark:border-blue-400/80 dark:bg-slate-900/82";

export const workstationChoiceRowDisabledClass =
  "cursor-not-allowed opacity-45";

export const desktopSplitLayoutClass =
  "grid min-h-0 gap-6 xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)] xl:items-start";

export const desktopPrimaryColumnClass =
  "flex min-w-0 flex-col gap-5";

export const desktopSecondaryColumnClass =
  "flex min-w-0 flex-col gap-5";

interface PanelIntroProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

export function PanelIntro({
  title,
  description,
  eyebrow,
  action,
  className,
}: PanelIntroProps) {
  return (
    <div
      className={cx(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface StatusBannerProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function StatusBanner({
  tone = "info",
  title,
  children,
  action,
  className,
  ...props
}: StatusBannerProps) {
  return (
    <div
      {...props}
      data-tone={tone}
      className={cx(
        "status-banner flex items-start gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </p>
        )}
        <div className="text-sm leading-6 text-slate-700 dark:text-slate-200">
          {children}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
