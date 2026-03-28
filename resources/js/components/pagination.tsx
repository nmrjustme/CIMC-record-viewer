import { Link } from '@inertiajs/react';

interface PaginationProps {
    data: {
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Pagination({ data }: PaginationProps) {
    if (!data.links || data.links.length <= 3) return null;

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--patients-border)] bg-black/5 px-8 py-4 md:flex-row dark:bg-black/40">
            {/* Page Stats */}
            <div className="text-[10px] font-bold tracking-widest text-[var(--patients-muted)] uppercase">
                Page {data.current_page} of {data.last_page} — {data.total}{' '}
                total
            </div>

            {/* Link Buttons */}
            <div className="flex flex-wrap justify-center gap-1">
                {data.links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll
                        preserveState
                        className={`flex h-8 min-w-[32px] items-center justify-center rounded px-3 text-[10px] font-bold transition-all ${
                            link.active
                                ? 'bg-[var(--patients-accent)] text-white shadow-md'
                                : 'border border-[var(--patients-border)] text-[var(--patients-text)] hover:border-[var(--patients-accent)]'
                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
