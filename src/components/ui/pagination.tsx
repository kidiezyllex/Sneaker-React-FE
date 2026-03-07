import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
export function Pagination({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex w-full justify-center items-center gap-2", className)}
      {...props}
    >
      {children}
    </nav>
  );
}

export function PaginationContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex items-center gap-1", className)} {...props} />;
}

export function PaginationItem({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />;
}

export function PaginationLink({
  className,
  href,
  isActive,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  return (
    <Link
      to={href || "#"}
      className={cn(
        "min-w-9 px-3 h-9 flex items-center justify-center rounded border text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-white border-primary shadow"
          : "bg-white text-gray-700 border-gray-300 hover:bg-primary/10 hover:text-primary",
        className
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  href,
  disabled,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean }) {
  return (
    <PaginationItem>
      <Link
        to={href || "#"}
        className={cn(
          "min-w-9 px-3 h-9 flex items-center justify-center rounded border text-sm font-medium transition-colors",
          disabled
            ? "bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-primary/10 hover:text-primary"
        )}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <Icon path={mdiChevronLeft} size={0.8} />
        Trước
      </Link>
    </PaginationItem>
  );
}

export function PaginationNext({
  className,
  href,
  disabled,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean }) {
  return (
    <PaginationItem>
      <Link
        to={href || "#"}
        className={cn(
          "min-w-9 px-3 h-9 flex items-center justify-center rounded border text-sm font-medium transition-colors",
          disabled
            ? "bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-primary/10 hover:text-primary"
        )}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        Sau
        <Icon path={mdiChevronRight} size={0.8} />
      </Link>
    </PaginationItem>
  );
}

export function PaginationEllipsis({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "px-2 h-9 flex items-center justify-center text-gray-700 text-lg select-none",
        className
      )}
    >
      ...
    </span>
  );
}
