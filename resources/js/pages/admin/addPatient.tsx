import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Patient } from '@/types/patient';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Patient',
        href: '/patients/create',
    },
];

// Skeleton loader
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

type Props = {
    patients: Patient[];
};

export default function AddPatient({ patients = [] }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        middlename: '',
        hrn: '',
    });

    const isAnyInputFilled =
        formData.firstname ||
        formData.lastname ||
        formData.middlename ||
        formData.hrn;

    const isAddDisabled =
        isLoading ||
        !formData.firstname ||
        !formData.lastname ||
        formData.hrn.length !== 15;

    const isClearDisabled = isLoading || !isAnyInputFilled;

    const handleAddPatient = () => {
        if (isAddDisabled) return;

        setIsLoading(true);

        router.post('/patients', formData, {
            onSuccess: () => {
                setFormData({
                    firstname: '',
                    lastname: '',
                    middlename: '',
                    hrn: '',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const handleClear = () => {
        setFormData({
            firstname: '',
            lastname: '',
            middlename: '',
            hrn: '',
        });
    };

    /*** PAGINATION STATE ***/
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(patients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPatients = patients.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    // Utility to generate pagination numbers with ellipsis
    const getPagination = (
        currentPage: number,
        totalPages: number,
        maxButtons = 5,
    ) => {
        const pages = [];

        if (totalPages <= maxButtons + 2) {
            // Show all pages if few pages
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            const left = Math.max(2, currentPage - 1);
            const right = Math.min(totalPages - 1, currentPage + 1);

            pages.push(1); // first page

            if (left > 2) pages.push('...');

            for (let i = left; i <= right; i++) pages.push(i);

            if (right < totalPages - 1) pages.push('...');

            pages.push(totalPages); // last page
        }

        return pages;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="relative min-h-screen bg-slate-100 font-sans text-slate-900">
                <Head title="Add Patient" />

                <main className="mx-auto max-w-6xl p-8">
                    {/* ADD PATIENT SECTION */}
                    <section className="mb-8 rounded-xl border border-slate-400 bg-white p-8">
                        <div className="mb-6 border-b border-slate-200 pb-4">
                            <h2 className="font-montserrat text-sm font-semibold text-slate-600 uppercase">
                                Add New Patient
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                            {/* HRN */}
                            <div>
                                <label className="mb-1.5 block font-montserrat text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                    HRN
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="000000000000000"
                                    value={formData.hrn}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(
                                            /\D/g,
                                            '',
                                        );
                                        if (val.length > 15)
                                            val = val.slice(0, 15);
                                        setFormData({ ...formData, hrn: val });
                                    }}
                                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 font-montserrat text-sm font-normal uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                    required
                                />
                                <div className="mt-1 flex items-center justify-end gap-2">
                                    <span
                                        className={`font-montserrat text-[10px] font-semibold ${
                                            formData.hrn.length === 15
                                                ? 'text-green-600'
                                                : formData.hrn.length > 0
                                                  ? 'text-orange-500'
                                                  : 'text-slate-400'
                                        }`}
                                    >
                                        {formData.hrn.length} / 15
                                    </span>
                                    {formData.hrn.length > 0 &&
                                        formData.hrn.length < 15 && (
                                            <span className="text-[10px] font-semibold text-orange-600 uppercase">
                                                ⚠ 15 digits required
                                            </span>
                                        )}
                                </div>
                            </div>

                            {/* LAST NAME */}
                            <div>
                                <label className="mb-1.5 block font-montserrat text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastname}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lastname: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 font-montserrat text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                />
                            </div>

                            {/* FIRST NAME */}
                            <div>
                                <label className="mb-1.5 block font-montserrat text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstname}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            firstname: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 font-montserrat text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                />
                            </div>

                            {/* MIDDLE NAME */}
                            <div>
                                <label className="mb-1.5 block font-montserrat text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.middlename}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            middlename: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 font-montserrat text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                />
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="mt-6 flex items-center gap-3">
                            <button
                                onClick={handleAddPatient}
                                disabled={isAddDisabled}
                                className={`min-w-[160px] rounded-md px-6 py-3 font-montserrat text-xs text-white transition-all ${
                                    isAddDisabled
                                        ? 'cursor-not-allowed bg-slate-300 opacity-60'
                                        : 'cursor-pointer bg-blue-800 shadow-md hover:bg-blue-700 active:scale-95'
                                }`}
                            >
                                {isLoading ? 'ADDING...' : 'ADD PATIENT'}
                            </button>

                            <button
                                onClick={handleClear}
                                disabled={isClearDisabled}
                                className={`rounded-md border px-6 py-3 font-montserrat text-xs transition-colors ${
                                    isClearDisabled
                                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
                                        : 'cursor-pointer border-slate-400 bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                CLEAR
                            </button>
                        </div>
                    </section>

                    {/* PATIENT TABLE */}
                    <section className="overflow-hidden rounded-xl border border-slate-400 bg-white">
                        <div className="border-b border-slate-200 bg-slate-50/50 px-8 py-4">
                            <h3 className="font-montserrat text-sm font-semibold text-slate-600 uppercase">
                                Patient List
                            </h3>
                        </div>

                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] tracking-widest text-slate-600 uppercase">
                                <tr>
                                    <th className="border-b border-slate-200 px-8 py-4 font-semibold">
                                        HRN
                                    </th>
                                    <th className="border-b border-slate-200 px-8 py-4 font-semibold">
                                        Patient Name
                                    </th>
                                    <th className="border-b border-slate-200 px-8 py-4 text-center font-semibold">
                                        Files
                                    </th>
                                    <th className="border-b border-slate-200 px-8 py-4 text-right font-semibold">
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
                                ) : currentPatients.length > 0 ? (
                                    currentPatients.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="transition-colors hover:bg-blue-50/30"
                                        >
                                            <td className="px-8 py-5 font-mono text-sm text-blue-600">
                                                {p.hrn}
                                            </td>
                                            <td className="px-8 py-5 font-montserrat text-sm font-semibold text-slate-800 capitalize">
                                                {p.lastname}, {p.firstname}{' '}
                                                {p.middlename || ''}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-600">
                                                    📄 {p.records_count ?? 0}{' '}
                                                    PDF(s)
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link
                                                    href={`/viewer/${p.hrn}/folder`}
                                                    className="inline-flex items-center rounded bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-600 hover:text-white"
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
                                            className="py-20 text-center text-xs font-semibold text-slate-400"
                                        >
                                            No patients yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {/* Pagination Controls */}
                        {patients.length > itemsPerPage && (
                            <div className="flex flex-wrap items-center justify-center gap-2 p-4">
                                {/* Prev button */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className={`rounded border px-3 py-1 text-sm ${
                                        currentPage === 1
                                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                            : 'bg-white text-slate-700 hover:bg-blue-50'
                                    }`}
                                >
                                    Prev
                                </button>

                                {/* Page numbers */}
                                {getPagination(currentPage, totalPages).map(
                                    (p, index) =>
                                        p === '...' ? (
                                            <span
                                                key={index}
                                                className="px-3 py-1 text-sm"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    setCurrentPage(Number(p))
                                                }
                                                className={`rounded border px-3 py-1 text-sm ${
                                                    p === currentPage
                                                        ? 'bg-blue-700 text-white'
                                                        : 'bg-white text-slate-700 hover:bg-blue-50'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                )}

                                {/* Next button */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className={`rounded border px-3 py-1 text-sm ${
                                        currentPage === totalPages
                                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                            : 'bg-white text-slate-700 hover:bg-blue-50'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </AppLayout>
    );
}
