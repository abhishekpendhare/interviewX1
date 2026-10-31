import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
    icon?: React.ElementType;
    badge?: string;
}

export interface SpotlightNavbarProps {
    items?: NavItem[];
    className?: string;
    onItemClick?: (item: NavItem, index: number) => void;
    defaultActiveIndex?: number;
}

export function SpotlightNavbar({
    items = [
        { label: "Mission Gateway", href: "/" },
        { label: "Career Planner", href: "/planner" },
        { label: "Code Arena (3.5K+)", href: "/compiler" },
        { label: "Foundations", href: "/foundations" },
        { label: "Voice Mock", href: "/simulator" },
        { label: "Neural Advisor", href: "/advisor" },
        { label: "Dossier", href: "/dossier" },
    ],
    className,
    onItemClick,
    defaultActiveIndex = 0,
}: SpotlightNavbarProps) {
    const location = useLocation();
    const navRef = useRef<HTMLElement>(null);
    
    // Find active index based on route location or fallback
    const computedActiveIndex = items.findIndex(item => 
        location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
    );
    const initialIndex = computedActiveIndex >= 0 ? computedActiveIndex : defaultActiveIndex;

    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [hoverX, setHoverX] = useState<number | null>(null);

    // Sync active index with router navigation
    useEffect(() => {
        if (computedActiveIndex >= 0) {
            setActiveIndex(computedActiveIndex);
        }
    }, [location.pathname, computedActiveIndex]);

    // Refs for the "light" positions so we can animate them imperatively
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            // Direct update for immediate feedback (no spring for the mouse itself, feels snappier)
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            // When mouse leaves, spring the spotlight back to the active item
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    }
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // Handle the "Ambience" (Active Item) Movement
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            animate(ambienceX.current, targetX, {
                type: "spring",
                stiffness: 200,
                damping: 20,
                onUpdate: (v) => {
                    ambienceX.current = v;
                    nav.style.setProperty("--ambience-x", `${v}px`);
                },
            });
        }
    }, [activeIndex]);

    const handleItemClick = (item: NavItem, index: number) => {
        setActiveIndex(index);
        onItemClick?.(item, index);
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <nav
                ref={navRef}
                className={cn(
                    "spotlight-nav relative h-10 sm:h-11 rounded-full transition-all duration-300 overflow-hidden",
                    "bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-subtle)] shadow-lg shadow-black/10 px-2 flex items-center"
                )}
                style={{
                    // CSS variables for light and dark modes
                    ["--spotlight-color" as any]: "var(--spotlight-glow, rgba(99, 102, 241, 0.2))",
                    ["--ambience-color" as any]: "var(--accent-primary, #6366f1)"
                }}
            >
                {/* Content */}
                <ul className="relative flex items-center h-full px-1 gap-0.5 z-[10] list-none m-0 p-0">
                    {items.map((item, idx) => {
                        const Icon = item.icon;
                        const isCurrentActive = activeIndex === idx;

                        return (
                            <li key={idx} className="relative h-full flex items-center justify-center">
                                <Link
                                    to={item.href}
                                    data-index={idx}
                                    onClick={() => handleItemClick(item, idx)}
                                    aria-current={isCurrentActive ? "page" : undefined}
                                    className={cn(
                                        "px-3 sm:px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 rounded-full flex items-center gap-1.5 whitespace-nowrap",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                                        // Active vs Inactive Text
                                        isCurrentActive
                                            ? "text-indigo-400 font-bold"
                                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    )}
                                >
                                    {Icon && <Icon className={cn("w-3.5 h-3.5", isCurrentActive ? "text-indigo-400" : "text-slate-400")} />}
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* LIGHTING LAYERS: CSS variables --spotlight-x and --ambience-x updated in real-time by rAF/animate */}

                {/* 1. The Moving Spotlight (Follows Mouse smoothly with radial illumination) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-[1] transition-opacity duration-300"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `
                            radial-gradient(
                                140px circle at var(--spotlight-x, 50%) 100%, 
                                var(--spotlight-color, rgba(99, 102, 241, 0.25)) 0%, 
                                transparent 65%
                            )
                        `
                    }}
                />

                {/* 2. The Active State Ambience (Glow anchor underneath the active item) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-[2.5px] z-[2]"
                    style={{
                        background: `
                            radial-gradient(
                                70px circle at var(--ambience-x, 50%) 0%, 
                                var(--ambience-color, #6366f1) 0%, 
                                transparent 100%
                            )
                        `
                    }}
                />
            </nav>
        </div>
    );
}
