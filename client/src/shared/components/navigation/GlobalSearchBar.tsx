/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useAuth } from "@app/providers/AuthProvider";
import { resolveSearchRoleContext } from "@shared/config/searchableRoutes";
import { useGlobalSearch } from "@shared/hooks/useGlobalSearch";
import { cn } from "@shared/utils/cn";

interface GlobalSearchBarProps {
  autoFocus?: boolean;
  compact?: boolean;
  onSelect?: () => void;
  inlineResults?: boolean;
}

export const GlobalSearchBar = ({
  autoFocus = false,
  compact = false,
  onSelect,
  inlineResults = false,
}: GlobalSearchBarProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isResultsMounted, setIsResultsMounted] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const roleContext = useMemo(
    () => resolveSearchRoleContext(roles, location.pathname),
    [location.pathname, roles],
  );
  const suggestions = useGlobalSearch(query, roleContext);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, roleContext]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setQuery("");
    setIsOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [autoFocus]);

  const showDropdown = isOpen && isInputFocused;
  const resultsClassName = inlineResults
    ? "mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    : "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.12)] dark:border-zinc-800 dark:bg-zinc-950";

  useEffect(() => {
    if (showDropdown) {
      setIsResultsMounted(true);
      const frame = window.requestAnimationFrame(() => {
        setIsResultsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setIsResultsVisible(false);
    const timeout = window.setTimeout(() => {
      setIsResultsMounted(false);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [showDropdown]);

  const selectSuggestion = (index: number) => {
    const selected = suggestions[index];
    if (!selected) {
      return;
    }

    navigate(selected.path);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(0);
    onSelect?.();
  };

  return (
    <div className="relative min-w-0 flex-1" ref={containerRef}>
      <label
        className={cn(
          "flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors duration-300 focus-within:border-zinc-400 focus-within:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:focus-within:border-zinc-500 dark:focus-within:bg-zinc-950",
          compact ? "px-3 py-2 text-[13px] sm:text-sm" : "px-3 py-2 text-sm",
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <input
          ref={inputRef}
          aria-label="Global search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="global-search-suggestions"
          className={cn(
            "w-full bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 transition-colors duration-300 dark:text-zinc-100 dark:placeholder:text-zinc-500",
            compact && "text-[13px] sm:text-sm",
          )}
          placeholder="Search pages, tools, or actions"
          value={query}
          onFocus={() => {
            setIsInputFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            setIsInputFocused(false);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((current) =>
                suggestions.length === 0 ? 0 : (current + 1) % suggestions.length,
              );
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((current) =>
                suggestions.length === 0
                  ? 0
                  : (current - 1 + suggestions.length) % suggestions.length,
              );
            }

            if (event.key === "Enter") {
              if (!showDropdown) {
                return;
              }

              event.preventDefault();
              selectSuggestion(activeIndex);
            }

            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </label>

      {isResultsMounted ? (
        <div
          id="global-search-suggestions"
          className={cn(
            resultsClassName,
            "transition-all duration-200 ease-out",
            inlineResults
              ? isResultsVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-1 opacity-0"
              : isResultsVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0",
          )}
          role="listbox"
        >
          {suggestions.length > 0 ? (
            <div className={cn("overflow-y-auto p-2", inlineResults ? "max-h-[calc(100vh-13rem)]" : "max-h-[22rem]")}>
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                      isActive
                        ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900/70",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectSuggestion(index);
                    }}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                        inlineResults ? "h-10 w-10" : "h-9 w-9",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-start justify-between gap-2">
                        <span className="min-w-0 flex-1 break-words text-sm font-semibold">
                          {suggestion.label}
                        </span>
                        <span className="shrink-0 text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                          {suggestion.section}
                        </span>
                      </span>
                      <span className="mt-1 block break-words text-xs text-zinc-500 dark:text-zinc-400">
                        {suggestion.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm text-zinc-500 dark:text-zinc-400">
              No results found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
