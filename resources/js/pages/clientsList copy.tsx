import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';

interface FileRecord {
    id: number;
    file_name: string;
    created_at: string;
    updated_at: string; // Added updated_at
}

interface Patient {
    hrn: string;
    firstname: string;
    lastname: string;
    middlename: string;
    records: FileRecord[];
}

export default function PatientFolder({ patient }: { patient: Patient }) {
    // 1. Identify the latest file based on the NEWEST of either created_at or updated_at
    const getLatestTime = (file: FileRecord) => {
        const created = new Date(file.created_at).getTime();
        const updated = new Date(file.updated_at).getTime();
        return Math.max(created, updated);
    };

    const latestFile =
        patient.records.length > 0
            ? [...patient.records].sort(
                  (a, b) => getLatestTime(b) - getLatestTime(a),
              )[0]
            : null;

    // 2. Filter out the latest file from the archive grid
    const otherFiles = patient.records.filter(
        (file) => file.id !== latestFile?.id,
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`${patient.lastname}'s File`} />
            <Header />

            <main className="mx-auto max-w-5xl p-8">
                <Link
                    href={`/viewer/record-finder`}
                    className="mb-6 inline-flex items-center gap-2 font-montserrat text-sm font-normal text-slate-500 transition-colors hover:text-blue-600"
                >
                    ← Back to Search
                </Link>

                <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-6">
                    <div>
                        <div className="flex flex-wrap gap-x-8 gap-y-4">
                            {/* Last Name */}
                            <div className="flex flex-col">
                                <h1 className="font-montserrat text-3xl leading-none font-bold text-slate-900 capitalize">
                                    {patient.lastname}
                                </h1>
                                <div className="mt-1 h-px w-full bg-slate-300" />{' '}
                                {/* The Divider Line */}
                                <span className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                    Lastname
                                </span>
                            </div>

                            {/* First Name */}
                            <div className="flex flex-col">
                                <h1 className="font-montserrat text-3xl leading-none font-bold text-slate-900 capitalize">
                                    {patient.firstname}
                                </h1>
                                <div className="mt-1 h-px w-full bg-slate-300" />
                                <span className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                    Firstname
                                </span>
                            </div>

                            {/* Middle Name */}
                            {patient.middlename && (
                                <div className="flex flex-col">
                                    <h1 className="font-montserrat text-3xl leading-none font-bold text-slate-900 capitalize">
                                        {patient.middlename}
                                    </h1>
                                    <div className="mt-1 h-px w-full bg-slate-300" />
                                    <span className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Middlename
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 font-montserrat text-sm font-normal tracking-widest text-slate-500 uppercase">
                            HRN:
                            <span className="ml-2 font-mono font-normal text-blue-600">
                                {patient.hrn}
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="rounded-full bg-blue-100 px-4 py-1 font-montserrat text-xs font-semibold text-blue-700">
                            {patient.records.length} Documents
                        </span>
                    </div>
                </div>

                {/* --- LATEST UPDATE SECTION --- */}
                {latestFile && (
                    <section className="mb-12">
                        <h3 className="mb-4 font-montserrat text-[10px] font-semibold tracking-[0.2em] text-blue-600 uppercase">
                            Most Recent Activity
                        </h3>

                        <div className="group relative flex items-center gap-6 rounded-2xl border-1 border-blue-400 bg-white p-6 transition-all">
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl transition-colors">
                                <img
                                    src="/images/pdf.png"
                                    alt="Document Icon"
                                    className="h-20 w-20 text-current transition-colors"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-montserrat text-lg font-bold text-slate-900">
                                    {latestFile.file_name}
                                </h4>
                                <div className="mt-2 flex flex-col gap-y-2 border-l-2 border-slate-100 pl-3">
                                    <div className="flex items-center gap-x-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />{' '}
                                        <span className="font-montserrat font-semibold">
                                            Created
                                        </span>
                                        <span className="font-mono text-slate-500">
                                            {new Date(
                                                latestFile.created_at,
                                            ).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                            <span className="px-2 text-slate-300">
                                                |
                                            </span>
                                            <span>
                                                (
                                                {new Date(
                                                    latestFile.created_at,
                                                ).toLocaleDateString()}
                                                )
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-x-2 text-[11px] font-bold tracking-widest text-blue-600 uppercase">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />{' '}
                                        <span className="font-montserrat font-semibold">
                                            Updated
                                        </span>
                                        <div className="flex items-center gap-x-2">
                                            <span className="font-mono">
                                                {new Date(
                                                    latestFile.updated_at,
                                                ).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                <span className="px-2 text-slate-300">
                                                    |
                                                </span>
                                                <span>
                                                    (
                                                    {new Date(
                                                        latestFile.updated_at,
                                                    ).toLocaleDateString()}
                                                    )
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={`/view-record/${latestFile.file_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md bg-blue-800 px-6 py-3 font-montserrat text-xs font-normal text-white transition-all hover:bg-blue-700 active:scale-95"
                            >
                                OPEN FILE
                            </a>
                        </div>
                    </section>
                )}

                {/* --- ARCHIVE SECTION --- */}
                <section>
                    <h3 className="mb-4 font-montserrat text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                        Archive List
                    </h3>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                        {otherFiles.length > 0 ? (
                            otherFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-400 bg-white p-6 text-center hover:border-red-500"
                                >
                                    {/* The invisible link anchor - covers the whole card */}
                                    <a
                                        href={`/view-record/${file.file_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 z-10"
                                        aria-label={`View ${file.file_name}`}
                                    />

                                    {/* Icon Container */}
                                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl transition-colors">
                                        <img
                                            src="/images/pdf.png"
                                            alt="Document Icon"
                                            className="h-15 w-15 text-current transition-colors"
                                        />
                                    </div>

                                    {/* File Name */}
                                    <h4 className="line-clamp-2 min-h-[2.5rem] w-full px-2 font-montserrat text-sm leading-tight font-bold text-slate-700 transition-colors group-hover:text-red-600">
                                        {file.file_name}
                                    </h4>

                                    {/* Metadata */}
                                    <div className="mt-3 flex w-full items-center justify-center gap-2 border-t border-slate-100 pt-3">
                                        <div className="flex flex-col items-center">
                                            {/* Label */}
                                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                Created
                                            </span>
                                            
                                            {/* Primary Date (Formatted) */}
                                            <p className="font-mono text-xs font-semibold text-slate-600">
                                                {new Date(
                                                    file.created_at,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    },
                                                )}
                                            </p>
                                            
                                            {/* Secondary Info (Full Numeric Date) */}
                                            <span className="text-[10px] font-medium text-slate-400/80">
                                                (
                                                {new Date(
                                                    file.created_at,
                                                ).toLocaleDateString()}
                                                )
                                            </span>
                                        </div>
                                    </div>

                                    {/* Floating "Open" Action (Visual Cue) */}
                                    <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                                        <svg
                                            className="h-4 w-4 text-red-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d=" orbit-10 10 0 11-20 0 10 10 0 0120 0zM15 9l-6 6m0-6l6 6"
                                            />
                                            {/* Or use a simple external link icon */}
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
                                <p className="text-sm text-slate-400">
                                    No other documents found.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
