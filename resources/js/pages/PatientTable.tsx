import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Patient, PatientHrn } from '@/types/patient';
import Pagination from '@/components/pagination';
interface Props {
    patients: {
        data: Patient[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    isLoading: boolean;
    variant?: 'search' | 'minimal';
    openHrnDropdown?: number | null;
    setOpenHrnDropdown?: (id: number | null) => void;
    SkeletonRow: React.ComponentType;
}

export default function PatientTable({
    patients,
    isLoading,
    variant = 'search',
    openHrnDropdown = null,
    setOpenHrnDropdown,
    SkeletonRow,
}: Props) {
    const patientData = patients.data || [];

    return (
        <section className="overflow-hidden rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)]">
            <div className="relative min-h-[400px] overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-[var(--patients-border)] text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase dark:bg-black/40">
                        <tr>
                            <th className="px-8 py-4">
                                HRN {variant === 'search' && 'Details'}
                            </th>
                            <th className="px-8 py-4">Patient Name</th>
                            <th className="hidden px-8 py-4 text-center md:table-cell">
                                Files
                            </th>
                            {/* <th className="px-8 py-4 text-right">Action</th> */}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--patients-border)]">
                        {isLoading ? (
                            <SkeletonRow />
                        ) : patientData.length > 0 ? (
                            patientData.map((p) => {
                                const otherHrns =
                                    p.hrns?.filter(
                                        (h: { hrn: string }) => h.hrn !== p.hrn,
                                    ) || [];
                                const isDropdownOpen = openHrnDropdown === p.id;

                                return (
                                    <tr
                                        key={p.id}
                                        className={`group transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${isDropdownOpen ? 'relative z-20 bg-black/5' : ''}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div
                                                className={`flex items-center gap-2 font-mono text-sm font-bold text-[var(--patients-accent)] ${variant === 'search' ? 'cursor-pointer hover:opacity-80' : ''}`}
                                                onClick={() =>
                                                    variant === 'search' &&
                                                    router.post(
                                                        `/viewer/folder`,
                                                        {
                                                            hrn: p.hrn,
                                                            from: 'search',
                                                        },
                                                    )
                                                }
                                            >
                                                <span
                                                    className={
                                                        variant === 'search'
                                                            ? 'hover:underline'
                                                            : ''
                                                    }
                                                >
                                                    {p.hrn}
                                                </span>
                                                {variant === 'search' && (
                                                    <span className="rounded-full bg-[var(--patients-accent)]/10 px-1.5 py-0.5 text-[8px] font-black tracking-tighter uppercase">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>

                                            {variant === 'search' &&
                                                otherHrns.length > 0 &&
                                                setOpenHrnDropdown && (
                                                    <div className="relative mt-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenHrnDropdown(
                                                                    isDropdownOpen
                                                                        ? null
                                                                        : p.id,
                                                                );
                                                            }}
                                                            className="flex cursor-pointer items-center gap-1 text-[9px] font-bold tracking-tight text-[var(--patients-muted)] uppercase"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <span>
                                                                    +{' '}
                                                                    {
                                                                        otherHrns.length
                                                                    }
                                                                </span>
                                                                <p>
                                                                    Other HRNs
                                                                </p>
                                                            </div>
                                                            <svg
                                                                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                                width="10"
                                                                height="10"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                            >
                                                                <path d="m6 9 6 6 6-6" />
                                                            </svg>
                                                        </button>
                                                        {isDropdownOpen && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-10"
                                                                    onClick={() =>
                                                                        setOpenHrnDropdown(
                                                                            null,
                                                                        )
                                                                    }
                                                                />
                                                                <div className="absolute top-full left-0 z-30 mt-2 w-56 animate-in rounded-md border border-[var(--patients-border)] bg-[var(--patients-section-bg)] p-2 shadow-xl fade-in slide-in-from-top-2">
                                                                    <div className="mb-2 border-b border-[var(--patients-border)] px-2 py-1 text-[8px] font-black text-[var(--patients-muted)] uppercase">
                                                                        Alternative
                                                                        HRNs
                                                                    </div>

                                                                    {otherHrns.map(
                                                                        (
                                                                            extra: PatientHrn, // Use the imported PatientHrn type
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    extra.id
                                                                                }
                                                                                className="px-2 py-1.5 font-mono text-[11px] text-[var(--patients-text)]"
                                                                            >
                                                                                {
                                                                                    extra.hrn
                                                                                }
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold uppercase">
                                            <span>
                                                {p.lastname}, {p.firstname}
                                            </span>
                                        </td>
                                        <td className="hidden px-8 py-5 text-center md:table-cell">
                                            <span className="text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                                {p.records_count ?? 0} PDF(s)
                                            </span>
                                        </td>
                                        {/* <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() =>
                                                    router.post(
                                                        '/viewer/folder',
                                                        {
                                                            hrn: p.hrn,
                                                            from:
                                                                variant ===
                                                                'search'
                                                                    ? 'search'
                                                                    : 'add',
                                                        },
                                                    )
                                                }
                                                className="cursor-pointer border border-[var(--patients-border)] px-4 py-1.5 text-[10px] font-bold uppercase transition-all hover:bg-[var(--patients-accent)] hover:text-white dark:hover:text-white"
                                            >
                                                {variant === 'search'
                                                    ? 'View'
                                                    : 'View Folder'}
                                            </button>
                                        </td> */}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-20 text-center text-xs font-black tracking-widest text-[var(--patients-muted)] uppercase"
                                >
                                    No Records Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination data={patients} />
        </section>
    );
}
