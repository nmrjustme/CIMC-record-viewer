import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Header from '@/components/header';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import PatientTable from '@/pages/PatientTable';
import { Patient } from '@/types/patient';

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Patient's Records", href: '/viewer/record-finder' },
];

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-4 py-4 md:px-8">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="mt-2 h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-900"></div>
        </td>
        <td className="px-4 py-4 md:px-8">
            <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800"></div>
        </td>
        <td className="hidden px-8 py-4 text-center md:table-cell">
            <div className="mx-auto h-5 w-12 rounded bg-zinc-200 dark:bg-zinc-800"></div>
        </td>
        <td className="px-4 py-4 text-right md:px-8">
            <div className="ml-auto h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800"></div>
        </td>
    </tr>
);

type PaginationLinks = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    patients: {
        data: Patient[];
        links: PaginationLinks[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters?: { first?: string; last?: string; mid?: string; hrn?: string };
    auth: { user: { role: string } };
};

export default function RecordFinder({ patients, filters, auth }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [resultCount, setResultCount] = useState(0);
    const [openHrnDropdown, setOpenHrnDropdown] = useState<number | null>(null);

    const isAdmin = auth.user.role === 'admin';
    const isStaff = auth.user.role === 'staff';
    const canUseDark = isAdmin || isStaff;

    useEffect(() => {
        if (!canUseDark) {
            document.documentElement.classList.remove('dark');
        }
    }, [canUseDark]);

    const MAX_LENGTH = 15;

    const [searchData, setSearchData] = useState({
        first: filters?.first || '',
        last: filters?.last || '',
        mid: filters?.mid || '',
        hrn: filters?.hrn || '',
    });

    const isNameActive = !!(
        searchData.first ||
        searchData.last ||
        searchData.mid
    );
    const isHrnActive = searchData.hrn.length > 0;
    const isAnyFieldFilled = isNameActive || isHrnActive;
    const isSearchDisabled = isLoading || !isAnyFieldFilled;

    const performSearch = (data: typeof searchData) => {
        setIsLoading(true);
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== ''),
        );

        router.get(`/viewer/record-finder`, filteredData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: (page) => {
                const results = page.props.patients as any;
                setResultCount(results.total || 0);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const handleClear = () => {
        setIsLoading(true);
        setSearchData({ first: '', last: '', mid: '', hrn: '' });
        router.get(
            `/viewer/record-finder`,
            {},
            {
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleHrnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, MAX_LENGTH);
        setSearchData((prev) => ({ ...prev, hrn: val }));
    };

    const handleNameChange = (field: string, value: string) => {
        const val = value.replace(/[0-9]/g, '');
        setSearchData((prev) => ({ ...prev, [field]: val }));
    };

    const pageContent = (
        <div className="relative min-h-screen bg-[var(--patients-sidebar-bg)] text-[var(--patients-text)] transition-colors duration-200">
            <Head title="Patient List" />
            {!isAdmin && <Header />}

            <div
                className={`fixed top-4 right-4 z-50 transform transition-all duration-500 md:top-24 md:right-8 ${showNotification ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}
            >
                <div className="flex items-center gap-4 rounded border border-[var(--patients-border)] bg-[var(--patients-section-bg)] p-4 shadow-xl">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--patients-accent)] text-white shadow-lg dark:text-black">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                            Search Results
                        </h4>
                        <p className="text-sm font-bold">
                            {resultCount} Records Found
                        </p>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-6xl p-4 md:p-8">
                <section className="mb-6 rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)] p-4 md:p-8">
                    <div className="mb-6 border-b border-[var(--patients-border)] pb-4">
                        <h2 className="text-xs font-bold tracking-widest text-[var(--patients-muted)] uppercase">
                            Patient Records
                        </h2>
                    </div>

                    <div className="flex flex-col gap-6 md:gap-8">
                        <div>
                            <div className="mb-2">
                                <label className="text-[10px] font-bold tracking-wider text-[var(--patients-muted)] uppercase">
                                    Hospital Record No. (HRN)
                                </label>
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={
                                    isNameActive
                                        ? 'HRN DISABLED'
                                        : 'Search by HRN...'
                                }
                                value={searchData.hrn}
                                disabled={isNameActive}
                                onChange={handleHrnChange}
                                className="w-full border-2 border-[var(--patients-border)] bg-black/5 px-4 py-3 font-mono text-xl tracking-[0.2em] transition-all outline-none focus:border-[var(--patients-accent)] disabled:bg-zinc-100 md:text-2xl dark:bg-black/40 dark:disabled:bg-zinc-900"
                            />
                            <div className="mt-1 text-right">
                                <span
                                    className={`text-[10px] font-bold ${searchData.hrn.length > 0 ? 'text-[var(--patients-accent)]' : 'text-[var(--patients-muted)]'}`}
                                >
                                    {searchData.hrn.length} / {MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        <div
                            className={`grid grid-cols-1 gap-4 border-t border-[var(--patients-border)] pt-6 transition-opacity duration-300 md:grid-cols-3 ${isHrnActive ? 'opacity-40' : 'opacity-100'}`}
                        >
                            {['last', 'first', 'mid'].map((field) => (
                                <div key={field}>
                                    <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-[var(--patients-muted)] uppercase">
                                        {field} Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={
                                            isHrnActive ? 'NAME DISABLED' : ''
                                        }
                                        value={
                                            searchData[
                                                field as keyof typeof searchData
                                            ]
                                        }
                                        disabled={isHrnActive}
                                        onChange={(e) =>
                                            handleNameChange(
                                                field,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-[var(--patients-border)] bg-[var(--patients-sidebar-bg)] px-3 py-2.5 text-sm uppercase shadow-[var(--input-shadow)] transition-all outline-none focus:border-[var(--patients-accent)] disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => performSearch(searchData)}
                                disabled={isSearchDisabled}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[var(--patients-accent)] px-6 py-3 text-xs font-black tracking-widest text-white uppercase transition-all hover:brightness-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 sm:min-w-[180px] dark:text-black"
                            >
                                {isLoading ? 'Searching...' : 'Search Records'}
                            </button>
                            <button
                                onClick={handleClear}
                                type="button"
                                disabled={
                                    isLoading ||
                                    (!isAnyFieldFilled &&
                                        Object.values(filters || {}).every(
                                            (v) => !v,
                                        ))
                                }
                                className="w-full cursor-pointer border border-[var(--patients-border)] px-6 py-3 text-xs font-bold text-[var(--patients-muted)] uppercase transition-colors hover:text-[var(--patients-text)] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </section>

                <PatientTable
                    patients={patients}
                    isLoading={isLoading}
                    openHrnDropdown={openHrnDropdown}
                    setOpenHrnDropdown={setOpenHrnDropdown}
                    SkeletonRow={SkeletonRow}
                />
            </main>
        </div>
    );

    return isAdmin ? (
        <AppLayout breadcrumbs={breadcrumbs}>{pageContent}</AppLayout>
    ) : (
        pageContent
    );
}
