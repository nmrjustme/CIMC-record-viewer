import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { MoreVertical, Trash2, AlertCircle, Clock } from 'lucide-react';

interface FileRecord {
    id: number;
    file_name: string;
    pdf_url: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRecords {
    data: FileRecord[];
    links: PaginationLinks[];
    total: number;
    current_page: number;
    last_page: number;
}

interface PatientArchiveProps {
    records: PaginatedRecords;
    otherFiles: FileRecord[];
    isAdmin: boolean;
    isStaff: boolean;
    isLoading: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
    selected: string;
    search: string;
    setSearch: (search: string) => void;
    categories: string[];
    openMenuId: number | null;
    isDuplicate: boolean;
    handleSelect: (value: string) => void;
    handleCreateBlankPdf: () => void;
    handleToggleMenu: (e: React.MouseEvent, id: number) => void;
    handleDeleteRecord: (id: number, name: string) => void;
    setSelectedRecord: (record: FileRecord) => void;
}

const sectionTitle =
    'mb-4 text-[10px] font-black tracking-[0.2em] text-[var(--patients-accent)] uppercase';

export default function PatientArchive({
    records,
    otherFiles,
    isAdmin,
    isStaff,
    isLoading,
    open,
    setOpen,
    selected,
    search,
    setSearch,
    categories,
    openMenuId,
    isDuplicate,
    handleSelect,
    handleCreateBlankPdf,
    handleToggleMenu,
    handleDeleteRecord,
    setSelectedRecord,
}: PatientArchiveProps) {
    
    // PRECISION SORTING: Identifies the ID of the record with the newest updated_at
    const latestFileId = useMemo(() => {
        if (!otherFiles || otherFiles.length === 0) return null;
        
        const sorted = [...otherFiles].sort((a, b) => {
            const timeA = new Date(a.updated_at).getTime();
            const timeB = new Date(b.updated_at).getTime();
            return timeB - timeA; // Descending order
        });
        
        return sorted[0].id;
    }, [otherFiles]);

    return (
        <section className="pb-20">
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                <h3 className={sectionTitle}>
                    Archive List{' '}
                    {records.last_page > 1 && `(Page ${records.current_page})`}
                </h3>
                
                {(isAdmin || isStaff) && (
                    <div className="flex flex-wrap items-center gap-3">
                        {isDuplicate && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-2 rounded border border-red-500/20 animate-pulse">
                                <AlertCircle size={12} />
                                <span>Category Already Exists</span>
                            </div>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setOpen(!open)}
                                className="cursor-pointer rounded border border-black bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white"
                            >
                                {search || selected} ▾
                            </button>
                            {open && (
                                <div className="absolute right-0 z-50 mt-2 w-64 rounded border border-gray-300 bg-white shadow-xl dark:border-gray-600 dark:bg-zinc-900">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Type or select..."
                                        className="w-full border-b px-3 py-2 text-xs outline-none dark:bg-transparent dark:text-white"
                                        autoFocus
                                    />
                                    <div className="max-h-48 overflow-y-auto">
                                        {categories
                                            .filter((cat) =>
                                                cat.toLowerCase().includes(search.toLowerCase())
                                            )
                                            .map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleSelect(cat)}
                                                    className="block w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        {search && !categories.includes(search) && (
                                            <button
                                                onClick={() => handleSelect(search)}
                                                className="block w-full px-4 py-2 text-left text-[10px] font-black uppercase text-blue-500 hover:bg-blue-50"
                                            >
                                                + Add "{search}"
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCreateBlankPdf}
                            disabled={isLoading || isDuplicate}
                            className={`rounded border px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 
                                ${isDuplicate 
                                    ? 'cursor-not-allowed border-gray-500 bg-gray-500/20 text-gray-500' 
                                    : 'cursor-pointer border-[var(--patients-accent)] bg-[var(--patients-accent)] text-white hover:brightness-90 active:scale-95'
                                } disabled:opacity-50`}
                        >
                            {isLoading ? 'Creating...' : isDuplicate ? 'Existing' : 'Create PDF'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {otherFiles.length > 0 ? (
                    otherFiles.map((file) => {
                        const isLatest = file.id === latestFileId;
                        
                        return (
                            <div
                                key={file.id}
                                onClick={() => setSelectedRecord(file)}
                                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 text-center transition-all hover:shadow-lg
                                    ${isLatest 
                                        ? 'border-[var(--patients-accent)] bg-[var(--patients-accent)]/5 ring-2 ring-[var(--patients-accent)]/20 scale-[1.02]' 
                                        : 'bg-[var(--patients-section-bg)] hover:border-[var(--patients-accent)]'
                                    }`}
                            >
                                {/* NEW: RECENTLY UPDATED BADGE */}
                                {isLatest && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--patients-accent)] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg z-10">
                                        <Clock size={10} className="animate-pulse" />
                                        RECENTLY UPDATED
                                    </div>
                                )}
                                {(isAdmin || isStaff) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleMenu(e, file.id);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/5 text-[var(--patients-muted)] hover:text-[var(--patients-accent)] cursor-pointer"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                )}

                                {openMenuId === file.id && (
                                    <div className="absolute top-10 right-2 z-20 w-40 animate-in overflow-hidden rounded-md border border-[var(--patients-border)] bg-[var(--patients-section-bg)] shadow-2xl duration-150 fade-in zoom-in slide-in-from-top-2">
                                        <div className="py-1">
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteRecord(file.id, file.file_name);
                                                    }}
                                                    className="flex w-full items-center px-4 py-2.5 text-[9px] font-black text-red-500 uppercase hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} className="mr-2" />
                                                    Delete Permanent
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <img
                                    src="/images/pdf.png"
                                    alt="PDF"
                                    className={`mb-4 h-12 w-12 transition-transform duration-300 group-hover:scale-110 
                                        ${isLatest ? 'opacity-100 drop-shadow-md' : 'opacity-60 group-hover:opacity-100'}`}
                                />
                                <h4 className="line-clamp-2 min-h-[2.5rem] text-[11px] font-black uppercase tracking-tight group-hover:text-[var(--patients-accent)]">
                                    {file.file_name}
                                </h4>
                                <div className="mt-4 w-full border-t border-[var(--patients-border)] pt-3">
                                    <p className="font-mono text-[9px] font-bold text-[var(--patients-muted)] uppercase">
                                        {/* Shows full time to verify logic during testing */}
                                        Updated: {new Date(file.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--patients-border)] py-20 text-center">
                        <div className="mb-4 rounded-full bg-[var(--patients-border)]/20 p-4">
                            <img src="/images/pdf.png" className="h-10 w-10 grayscale opacity-20" alt="" />
                        </div>
                        <p className="text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                            No archived records found
                        </p>
                    </div>
                )}
            </div>

            {records.links.length > 3 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                    {records.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`flex h-9 min-w-[36px] items-center justify-center rounded px-3 text-[10px] font-black uppercase transition-all
                                ${link.active 
                                    ? 'bg-[var(--patients-accent)] text-white shadow-lg' 
                                    : link.url 
                                        ? 'border border-[var(--patients-border)] bg-[var(--patients-section-bg)] text-[var(--patients-muted)] hover:border-[var(--patients-accent)] hover:text-[var(--patients-accent)]' 
                                        : 'cursor-not-allowed opacity-20'
                                }`}
                            preserveScroll
                        />
                    ))}
                </div>
            )}
        </section>
    );
}