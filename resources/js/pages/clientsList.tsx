import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Header from '@/components/header';
import { Patient } from '@/types/patient';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/viewer/record-finder',
    },
];

// Skeleton loader for table rows
const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-8 py-4">
            <div className="h-4 w-24 rounded bg-slate-200"></div>
        </td>
        <td className="px-8 py-4">
            <div className="h-4 w-48 rounded bg-slate-200"></div>
        </td>
        <td className="px-8 py-4 text-center">
            <div className="mx-auto h-5 w-12 rounded bg-slate-200"></div>
        </td>
        <td className="px-8 py-4 text-right">
            <div className="ml-auto h-4 w-20 rounded bg-slate-200"></div>
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

    filters?: {
        first?: string;
        last?: string;
        mid?: string;
        hrn?: string;
    };
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: 'admin' | 'staff' | 'viewer';
        };
    };
};

export default function RecordFinder({ patients, filters, auth }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [resultCount, setResultCount] = useState(0);
    const isAdmin = auth.user.role === 'admin';

    const MAX_LENGTH = 15;
    const ZERO_STRING = '000000000';
    const patientData = patients.data || [];

    const [searchData, setSearchData] = useState({
        first: filters?.first || '',
        last: filters?.last || '',
        mid: filters?.mid || '',
        hrn: filters?.hrn || '',
    });

    const isAnyInputFilled =
        searchData.first.trim() !== '' ||
        searchData.last.trim() !== '' ||
        searchData.mid.trim() !== '' ||
        searchData.hrn.trim() !== '';

    const isNameActive = searchData.first || searchData.last || searchData.mid;
    const isHrnActive = searchData.hrn.length > 0;

    const handleCopy = () => {
        if (isNameActive) return;
        navigator.clipboard.writeText(ZERO_STRING);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isSearchDisabled =
        isLoading ||
        (isHrnActive && searchData.hrn.length < MAX_LENGTH) ||
        !isAnyInputFilled;

    const isClearDisabled = isLoading || !isAnyInputFilled;

    const handleSearch = () => {
        if (isSearchDisabled) return;

        setIsLoading(true);
        const finalHrn = searchData.hrn
            ? searchData.hrn.padStart(MAX_LENGTH, '0')
            : '';

        const dataToSend = {
            hrn: finalHrn,
            first: searchData.first,
            last: searchData.last,
            mid: searchData.mid,
        };

        const filteredData = Object.entries(dataToSend).reduce(
            (acc, [key, value]) => {
                if (value !== '') acc[key] = value;
                return acc;
            },
            {} as any,
        );

        router.get(`/viewer/record-finder`, filteredData, {
            preserveState: true,
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
        if (isClearDisabled) return;

        setIsLoading(true);
        setSearchData({ first: '', last: '', mid: '', hrn: '' });
        setShowNotification(false);
        router.get(
            `/viewer/record-finder`,
            {},
            {
                preserveState: false,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const pageContent = (
        <div className="relative min-h-screen bg-slate-100 font-sans text-slate-900">
            <Head title="Patient List" />

            {auth.user.role !== 'admin' && <Header />}

            {/* NOTIFICATION ALERT */}
            <div
                className={`fixed top-24 right-8 z-50 transform transition-all duration-500 ${
                    showNotification
                        ? 'translate-x-0 opacity-100'
                        : 'pointer-events-none translate-x-full opacity-0'
                }`}
            >
                <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-5 shadow-2xl shadow-blue-200/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <div className="min-w-[140px]">
                        <h4 className="text-[10px] font-black tracking-widest text-blue-600 uppercase">
                            Search Found
                        </h4>
                        <p className="font-montserrat text-sm font-semibold text-slate-700">
                            {resultCount}{' '}
                            {resultCount === 1
                                ? 'Patient Record'
                                : 'Patient Records'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNotification(false)}
                        className="ml-2 text-slate-300 transition-colors hover:text-slate-500"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <main className="mx-auto max-w-6xl p-8">
                {/* SEARCH SECTION */}
                <section className="mb-8 rounded-xl border border-slate-400 bg-white p-8">
                    <div className="mb-6 border-b border-slate-200 pb-4">
                        <h2 className="font-montserrat text-sm font-semibold text-slate-600 uppercase">
                            Search Patient Records
                        </h2>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* HRN Input */}
                        <div
                            className={`w-full transition-opacity ${isNameActive ? 'opacity-40' : 'opacity-100'}`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <label className="mr-1 block font-montserrat text-[11px] font-semibold tracking-wider text-blue-600 uppercase">
                                    Hospital Record No. (HRN)
                                </label>
                                <button
                                    onClick={handleCopy}
                                    type="button"
                                    disabled={isNameActive}
                                    className="flex cursor-pointer items-center gap-1.5 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-slate-400 transition-colors hover:text-blue-600 disabled:cursor-not-allowed"
                                >
                                    <span className="font-mono text-[10px]">
                                        {ZERO_STRING}
                                    </span>
                                    {copied ? (
                                        <span className="font-mono text-[10px] text-green-500">
                                            ✓
                                        </span>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                x="9"
                                                y="9"
                                                width="13"
                                                height="13"
                                                rx="2"
                                                ry="2"
                                            ></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={
                                    isNameActive
                                        ? 'HRN Disabled'
                                        : '000000000000000'
                                }
                                value={searchData.hrn}
                                disabled={isNameActive}
                                onChange={(e) => {
                                    const val = e.target.value.replace(
                                        /\D/g,
                                        '',
                                    );
                                    if (val.length <= MAX_LENGTH)
                                        setSearchData({
                                            ...searchData,
                                            hrn: val,
                                        });
                                }}
                                className={`w-full rounded-lg border px-4 py-4 font-mono text-2xl tracking-[0.2em] transition-all outline-none disabled:cursor-not-allowed disabled:bg-slate-100 ${
                                    isHrnActive &&
                                    searchData.hrn.length < MAX_LENGTH
                                        ? 'border-orange-300 bg-orange-50 text-orange-800 focus:ring-4 focus:ring-orange-100'
                                        : 'border-blue-200 bg-blue-50/50 text-blue-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                }`}
                            />
                            <div className="mt-2 flex items-center justify-between px-1">
                                <span className="font-montserrat text-[10px] font-semibold text-orange-600 uppercase">
                                    {isHrnActive &&
                                        searchData.hrn.length < MAX_LENGTH &&
                                        '⚠ 15 digits required'}
                                </span>
                                <span
                                    className={`font-mono text-xs ${
                                        searchData.hrn.length === MAX_LENGTH
                                            ? 'text-green-600'
                                            : isHrnActive
                                              ? 'text-orange-500'
                                              : 'text-slate-400'
                                    }`}
                                >
                                    {searchData.hrn.length} / {MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        {/* PERSONAL INFO */}
                        <div
                            className={`grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 transition-opacity md:grid-cols-3 ${
                                isHrnActive ? 'opacity-40' : 'opacity-100'
                            }`}
                        >
                            {['last', 'first', 'mid'].map((field) => (
                                <div key={field}>
                                    <label className="mb-1.5 block font-montserrat text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                        {field === 'last'
                                            ? 'Last Name'
                                            : field === 'first'
                                              ? 'First Name'
                                              : 'Middle Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            searchData[
                                                field as keyof typeof searchData
                                            ]
                                        }
                                        disabled={isHrnActive}
                                        placeholder={
                                            isHrnActive ? 'Disabled' : ''
                                        }
                                        onChange={(e) =>
                                            setSearchData({
                                                ...searchData,
                                                [field]: e.target.value.replace(
                                                    /[0-9]/g,
                                                    '',
                                                ),
                                            })
                                        }
                                        className="w-full rounded-md border border-slate-400 bg-slate-50 px-3 py-2.5 font-montserrat text-sm font-normal uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex items-center justify-start gap-3 pt-2">
                            <button
                                onClick={handleSearch}
                                disabled={isSearchDisabled}
                                className={`min-w-[160px] rounded-md px-6 py-3 font-montserrat text-xs font-normal text-white transition-all ${
                                    isSearchDisabled
                                        ? 'cursor-not-allowed bg-slate-300 opacity-60'
                                        : 'cursor-pointer bg-blue-800 shadow-md hover:bg-blue-700 active:scale-95'
                                }`}
                            >
                                {isLoading ? 'SEARCHING...' : 'SEARCH RECORDS'}
                            </button>
                            <button
                                onClick={handleClear}
                                type="button"
                                disabled={isClearDisabled}
                                className={`rounded-md border px-6 py-3 font-montserrat text-xs font-normal transition-colors ${
                                    isClearDisabled
                                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
                                        : 'cursor-pointer border-slate-400 bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                CLEAR FILTERS
                            </button>
                        </div>
                    </div>
                </section>

                {/* RESULTS TABLE */}
                <section className="overflow-hidden rounded-xl border border-slate-400 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50/50 px-8 py-4">
                        <h3 className="font-montserrat text-sm font-semibold text-slate-600 uppercase">
                            Found {patients.length} Patient Results
                        </h3>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] tracking-widest text-slate-600 uppercase">
                            <tr>
                                <th className="border-b border-slate-200 px-8 py-4 font-montserrat font-semibold">
                                    HRN
                                </th>
                                <th className="border-b border-slate-200 px-8 py-4 font-montserrat font-semibold">
                                    Patient Name
                                </th>
                                <th className="border-b border-slate-200 px-8 py-4 text-center font-montserrat font-semibold">
                                    Files
                                </th>
                                <th className="border-b border-slate-200 px-8 py-4 text-right font-montserrat font-semibold">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : patientData.length > 0 ? (
                                patientData.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="transition-colors hover:bg-blue-50/30"
                                    >
                                        <td className="px-8 py-5 font-mono text-sm font-normal tracking-tight text-blue-600">
                                            {p.hrn}
                                        </td>
                                        <td className="px-8 py-5 font-montserrat text-sm font-semibold text-slate-800 capitalize">
                                            {p.lastname}, {p.firstname}{' '}
                                            {p.middlename || ''}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 font-montserrat text-[10px] font-semibold text-slate-600">
                                                📄 {p.records_count} PDF(s)
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link
                                                href={`/viewer/${p.hrn}/folder`}
                                                className="inline-flex items-center rounded bg-blue-50 px-3 py-1.5 font-montserrat text-[11px] font-semibold text-blue-700 transition-all hover:bg-blue-600 hover:text-white"
                                            >
                                                VIEW FILE
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-20 text-center font-montserrat text-xs font-semibold text-slate-400"
                                    >
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* TABLE FOOTER / PAGINATION */}
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-8 py-4">
                        <div className="font-montserrat text-xs font-medium text-slate-500 uppercase">
                            Showing {patients.data.length} of {patients.total}{' '}
                            Records
                        </div>

                        <div className="flex gap-1">
                            {patients.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`flex h-8 min-w-[32px] items-center justify-center rounded px-2 text-[10px] font-bold transition-all ${
                                        link.active
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : link.url
                                              ? 'border border-slate-300 bg-white text-slate-600 hover:bg-blue-50'
                                              : 'cursor-not-allowed bg-transparent text-slate-300'
                                    }`}
                                    preserveScroll // Keeps the user's scroll position
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );

    return isAdmin ? (
        <AppLayout breadcrumbs={breadcrumbs}>{pageContent}</AppLayout>
    ) : (
        pageContent
    );
}
