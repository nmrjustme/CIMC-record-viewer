import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';

// --- Interfaces ---
interface Address {
    id: number;
    street: string;
    barangay: string;
    municipality: string;
    province: string;
}

interface PatientInformation {
    id: number;
    civil_status: string;
    nationality: string;
    birthdate: string;
    place_of_birth: string;
    phone_number: string;
    religion: string;
    address?: Address | null;
}

interface FileRecord {
    id: number;
    file_name: string;
    pdf_url: string | null;
    created_at: string;
    updated_at: string;
    file_count?: number;
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

interface HRN {
    id: number;
    hrn: string;
    is_primary: boolean;
}

interface Patient {
    id: number;
    hrn: string;
    firstname: string;
    lastname: string;
    middlename: string;
    information?: PatientInformation | null;
    hrns?: HRN[];
}

type Props = {
    patient: Patient;
    records: PaginatedRecords;
    auth: { user: { role: string } };
    fromPage: 'search' | 'add';
};

export default function PatientFolder({
    patient,
    records,
    auth,
    fromPage,
}: Props) {
    const [selectedRecord, setSelectedRecord] = useState<FileRecord | null>(
        null,
    );

    const [isOPDModalOpen, setOpenOPDModal] = useState(false);
    const [isLabModalOpen, setOpenLabModal] = useState(false);
    const [isRadioModalOpen, setOpenRadioModal] = useState(false);

    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isAddHRNModalOpen, setIsAddHRNModalOpen] = useState(false);
    const [isHRNModalOpen, setIsHRNModalOpen] = useState(false);
    const otherHRNs = patient.hrns?.filter((h) => !h.is_primary) || [];

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState('Add');

    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([
        'OPD RECORD',
        'LABORATORY',
        'RADIO',
    ]);

    const handleSelect = (value) => {
        setSelected(value);
        setSearch(value);
        setOpen(false);

        // OPTIONAL: save new category dynamically
        if (!categories.includes(value)) {
            setCategories([...categories, value]);
        }
    };

    // Theme & Role Logic
    const isAdmin = auth.user.role === 'admin';
    const isStaff = auth.user.role === 'staff';
    const canUseDark = isAdmin || isStaff;

    useEffect(() => {
        if (!canUseDark) {
            document.documentElement.classList.remove('dark');
        }
    }, [canUseDark]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Patient's Folder", href: '/viewer/record-finder' },
    ];

    const { data, setData, post, processing, reset, errors } = useForm({
        patient_id: patient.id, // IMPORTANT: make sure patient.id exists in props
        hrn: '',
    });

    // Functional Logic: Identify Latest File
    const allFilesOnPage = records.data || [];
    const getLatestTime = (file: FileRecord) => {
        const created = new Date(file.created_at).getTime();
        const updated = new Date(file.updated_at).getTime();
        return Math.max(created, updated);
    };

    const latestFile =
        records.current_page === 1 && allFilesOnPage.length > 0
            ? [...allFilesOnPage].sort(
                  (a, b) => getLatestTime(b) - getLatestTime(a),
              )[0]
            : null;

    const otherFiles = latestFile
        ? allFilesOnPage.filter((file) => file.id !== latestFile.id)
        : allFilesOnPage;

    const submitHRN = (e: React.FormEvent) => {
        e.preventDefault();

        (post('/patients/add-hrn'),
            {
                onSuccess: () => {
                    reset();
                    setIsAddHRNModalOpen(false);
                },
            });
    };

    // Common UI Classes
    const labelClass =
        'text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase';
    const sectionTitle =
        'mb-4 text-[10px] font-black tracking-[0.2em] text-[var(--patients-accent)] uppercase';

    console.log({ isAdmin, isStaff });
    const pageContent = (
        <div className="min-h-screen bg-[var(--patients-sidebar-bg)] text-[var(--patients-text)] transition-colors duration-200">
            <Head title={`${patient.lastname}'s Records`} />

            {!isAdmin && <Header />}

            <main className="mx-auto max-w-6xl p-4 md:p-8">
                {/* Navigation */}
                <Link
                    href={
                        fromPage === 'add'
                            ? '/patients/create'
                            : '/viewer/record-finder'
                    }
                    className="mb-6 inline-flex items-center gap-2 text-xs font-black tracking-widest text-[var(--patients-muted)] uppercase transition-colors hover:text-[var(--patients-accent)]"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    {fromPage === 'add' ? 'Back to Add Page' : 'Back to Search'}
                </Link>

                {/* --- Unified Patient Section --- */}
                <div className="mb-10 overflow-hidden rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)]">
                    <div className="border-b border-[var(--patients-border)] bg-black/10 p-6 md:p-8 dark:bg-black/40">
                        <div className="flex flex-col justify-between gap-6 md:flex-row">
                            {/* LEFT: Names */}
                            <div className="flex flex-wrap gap-x-12 gap-y-6">
                                {[
                                    {
                                        label: 'Last Name',
                                        value: patient.lastname,
                                    },
                                    {
                                        label: 'First Name',
                                        value: patient.firstname,
                                    },
                                    {
                                        label: 'Middle Name',
                                        value: patient.middlename,
                                    },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <h1 className="text-2xl font-black tracking-tight uppercase md:text-3xl">
                                            {item.value || '---'}
                                        </h1>
                                        <div className="mt-1 h-1 w-full bg-[var(--patients-accent)] opacity-30" />
                                        <span className={`${labelClass} mt-2`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* RIGHT: HRN block */}
                            <div className="flex flex-col items-end gap-1.5 text-right">
                                {/* HRN */}
                                <p className="font-mono text-lg tracking-widest text-[var(--patients-muted)] uppercase">
                                    HRN:{' '}
                                    <span className="font-bold text-[var(--patients-accent)]">
                                        {patient.hrn}
                                    </span>
                                </p>

                                {/* ADD & VIEW HRN BUTTON */}
                                <div className="flex justify-center gap-6">
                                    {(isAdmin || isStaff) && (
                                        <button
                                            onClick={() =>
                                                setIsAddHRNModalOpen(true)
                                            }
                                            className={`${sectionTitle} flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition-all duration-150 hover:border-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:bg-gray-800`}
                                        >
                                            <span className="font-bold text-[var(--patients-accent)]">
                                                &gt;&gt;
                                            </span>
                                            <span>Add</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setIsHRNModalOpen(true)}
                                        className={`${sectionTitle} flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition-all duration-150 hover:border-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:bg-gray-800`}
                                    >
                                        <span className="font-bold text-[var(--patients-accent)]">
                                            &gt;&gt;
                                        </span>
                                        <span>View More</span>
                                    </button>
                                </div>
                                {/* Total Docs */}
                                <span className="mt-1 px-4 text-[10px] font-black tracking-wide text-[var(--patients-accent)] uppercase opacity-80">
                                    {records.total} Total Documents
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 border-b border-[var(--patients-border)] bg-black/5 py-3 text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase transition-all hover:bg-[var(--patients-accent)] hover:text-white dark:hover:text-black"
                    >
                        {isInfoOpen
                            ? 'Hide Patient Information'
                            : 'View Patient Information'}
                    </button>

                    <div
                        className={`grid grid-cols-1 transition-all duration-300 ease-in-out md:grid-cols-3 ${isInfoOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
                    >
                        {/* CONTACT & STATUS */}
                        <div className="flex flex-col border-b border-[var(--patients-border)] p-6 md:border-r md:border-b-0">
                            <h4
                                className={
                                    labelClass + ' mb-4 flex items-center gap-2'
                                }
                            >
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" />{' '}
                                Contact & Status
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                        Phone
                                    </p>
                                    <p className="font-mono text-sm font-black">
                                        {patient.information?.phone_number ||
                                            'UNLISTED'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="border border-[var(--patients-border)] px-2 py-0.5 text-[10px] font-bold uppercase">
                                        {patient.information?.civil_status ||
                                            'Unknown'}
                                    </span>
                                    <span className="border border-[var(--patients-border)] px-2 py-0.5 text-[10px] font-bold uppercase">
                                        {patient.information?.nationality ||
                                            'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* BIRTH & RELIGION */}
                        <div className="flex flex-col border-b border-[var(--patients-border)] p-6 md:border-r md:border-b-0">
                            <h4
                                className={
                                    labelClass + ' mb-4 flex items-center gap-2'
                                }
                            >
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" />{' '}
                                Birth & Religion
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                        Birthday
                                    </p>
                                    <p className="text-sm font-black uppercase">
                                        {patient.information?.birthdate
                                            ? new Date(
                                                  patient.information.birthdate,
                                              ).toLocaleDateString('en-US', {
                                                  month: 'long',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                              })
                                            : 'NOT PROVIDED'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                        Religion
                                    </p>
                                    <p className="text-sm font-bold text-[var(--patients-muted)] uppercase">
                                        {patient.information?.religion ||
                                            'None specified'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div className="flex flex-col p-6">
                            <h4
                                className={
                                    labelClass + ' mb-4 flex items-center gap-2'
                                }
                            >
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" />{' '}
                                Full Address
                            </h4>
                            {patient.information?.address ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase">
                                        {patient.information.address.street}
                                    </p>
                                    <div className="space-y-0.5 text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                        <p className="flex justify-between">
                                            <span>Brgy:</span>{' '}
                                            <span>
                                                {
                                                    patient.information.address
                                                        .barangay
                                                }
                                            </span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span>City:</span>{' '}
                                            <span>
                                                {
                                                    patient.information.address
                                                        .municipality
                                                }
                                            </span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span>Prov:</span>{' '}
                                            <span>
                                                {
                                                    patient.information.address
                                                        .province
                                                }
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[10px] text-[var(--patients-muted)] uppercase italic">
                                    No address on file
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- LATEST UPDATE SECTION --- */}
                {latestFile && (
                    <section className="mb-12">
                        <h3 className={sectionTitle}>Most Recently Updated</h3>
                        <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-[var(--patients-accent)] bg-[var(--patients-section-bg)] p-6 shadow-[var(--input-shadow)] sm:flex-row">
                            <img
                                src="/images/pdf.png"
                                alt="PDF"
                                className="h-16 w-16 opacity-80"
                            />
                            <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-lg font-black tracking-tight uppercase">
                                    {latestFile.file_name}
                                </h4>
                                <div className="mt-2 flex flex-col gap-y-1 sm:border-l-2 sm:border-[var(--patients-border)] sm:pl-4">
                                    <div className="flex items-center justify-center gap-x-2 text-[10px] font-black text-[var(--patients-muted)] uppercase sm:justify-start">
                                        <span>Created:</span>
                                        <span className="font-mono">
                                            {new Date(
                                                latestFile.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-x-2 text-[10px] font-black text-[var(--patients-accent)] uppercase sm:justify-start">
                                        <span className="h-1.5 w-1.5 animate-pulse bg-[var(--patients-accent)]" />
                                        <span>Updated:</span>
                                        <span className="font-mono">
                                            {new Date(
                                                latestFile.updated_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(latestFile)}
                                className="w-full cursor-pointer bg-[var(--patients-accent)] px-8 py-3 text-xs font-black text-white uppercase transition-all hover:brightness-90 active:scale-95 sm:w-auto dark:text-black"
                            >
                                View PDF
                            </button>
                        </div>
                    </section>
                )}

                {/* --- ARCHIVE LIST --- */}
                <section className="pb-20">
                    {/* Add file Buttons */}
                    <div className="flex items-center justify-between gap-4">
                        <h3 className={sectionTitle}>
                            Archive List{' '}
                            {records.last_page > 1 &&
                                `(Page ${records.current_page})`}
                        </h3>
                        {(isAdmin || isStaff) && (
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <button
                                        onClick={() => setOpen(!open)}
                                        className={`${sectionTitle} cursor-pointer rounded border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black`}
                                    >
                                        {search || selected} ▾
                                    </button>

                                    {open && (
                                        <div className="absolute left-0 z-50 mt-2 w-64 rounded border border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-black">
                                            {/* Input field */}
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                placeholder="Type or select..."
                                                className="w-full border-b px-3 py-2 outline-none dark:bg-black"
                                            />

                                            {/* Suggestions */}
                                            <div className="max-h-40 overflow-y-auto">
                                                {categories
                                                    .filter((cat) =>
                                                        cat
                                                            .toLowerCase()
                                                            .includes(
                                                                search.toLowerCase(),
                                                            ),
                                                    )
                                                    .map((cat) => (
                                                        <button
                                                            key={cat}
                                                            onClick={() =>
                                                                handleSelect(
                                                                    cat,
                                                                )
                                                            }
                                                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}

                                                {/* If no match → allow adding */}
                                                {search &&
                                                    !categories.includes(
                                                        search,
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                handleSelect(
                                                                    search,
                                                                )
                                                            }
                                                            className="block w-full px-4 py-2 text-left text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            Add "{search}"
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={async () => {
                                        try {
                                            const formData = new FormData();
                                            formData.append(
                                                'category',
                                                selected,
                                            ); // send selected category

                                            const res = await fetch(
                                                '/pdf/create-blank',
                                                {
                                                    method: 'POST',
                                                    body: formData,
                                                    headers: {
                                                        'X-CSRF-TOKEN': document
                                                            .querySelector(
                                                                'meta[name="csrf-token"]',
                                                            )
                                                            ?.getAttribute(
                                                                'content',
                                                            ),
                                                        Accept: 'application/json',
                                                    },
                                                    credentials: 'same-origin', // 🔥 IMPORTANT
                                                },
                                            );
                                            if (!res.ok) {
                                                const text = await res.text();
                                                console.error(
                                                    'Server error:',
                                                    text,
                                                );
                                                alert(
                                                    'Request failed (check console)',
                                                );
                                                return;
                                            }

                                            const data = await res.json();

                                            if (data.success) {
                                                // open PDF in a new tab
                                                window.open(
                                                    data.path,
                                                    '_blank',
                                                );
                                            } else {
                                                alert('Failed to create PDF.');
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert('Error creating PDF.');
                                        }
                                    }}
                                    className={`${sectionTitle} cursor-pointer rounded border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black`}
                                >
                                    Create PDF
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                        {otherFiles.length > 0 ? (
                            otherFiles.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => setSelectedRecord(file)}
                                    className="group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-[var(--patients-border)] bg-[var(--patients-section-bg)] p-6 text-center transition-all hover:border-[var(--patients-accent)]"
                                >
                                    <img
                                        src="/images/pdf.png"
                                        alt="PDF"
                                        className="mb-4 h-10 w-10 opacity-60 transition-opacity group-hover:opacity-100"
                                    />
                                    <h4 className="line-clamp-2 text-[11px] font-black uppercase group-hover:text-[var(--patients-accent)]">
                                        {file.file_name}
                                    </h4>
                                    <div className="mt-4 w-full border-t border-[var(--patients-border)] pt-3">
                                        <p className="font-mono text-[9px] font-bold text-[var(--patients-muted)]">
                                            {new Date(
                                                file.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full rounded-lg border-2 border-dashed border-[var(--patients-border)] py-12 text-center text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                No archived records found
                            </div>
                        )}
                    </div>

                    {/* --- PAGINATION CONTROLS --- */}
                    {records.links.length > 3 && (
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-1">
                            {records.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`flex h-10 min-w-[40px] items-center justify-center rounded px-3 text-[10px] font-black uppercase transition-all ${
                                        link.active
                                            ? 'bg-[var(--patients-accent)] text-white shadow-md dark:text-black'
                                            : link.url
                                              ? 'border border-[var(--patients-border)] bg-[var(--patients-section-bg)] text-[var(--patients-muted)] hover:border-[var(--patients-accent)] hover:text-[var(--patients-text)]'
                                              : 'cursor-not-allowed opacity-20'
                                    }`}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* --- MODAL PDF VIEWER --- */}
            {selectedRecord && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-white/10 bg-black p-4 text-white">
                        <div>
                            <span className="text-[9px] font-black tracking-[0.2em] text-[var(--patients-accent)] uppercase">
                                CIMC Record Viewer
                            </span>
                            <h2 className="max-w-[200px] truncate text-sm font-black uppercase md:max-w-md">
                                {selectedRecord.file_name}
                            </h2>
                        </div>
                        <button
                            onClick={() => setSelectedRecord(null)}
                            className="cursor-pointer bg-red-600 px-4 py-2 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-red-700"
                        >
                            Close
                        </button>
                    </div>
                    <div className="flex-1 bg-zinc-900">
                        {selectedRecord.pdf_url ? (
                            <iframe
                                src={`${selectedRecord.pdf_url}#toolbar=1&view=FitW`}
                                className="h-full w-full border-none"
                                title={selectedRecord.file_name}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs font-black text-zinc-500 uppercase">
                                Path Error: No PDF source found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL VIEW HRN */}
            {/* --- HRN MODAL --- */}
            {isHRNModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-[var(--patients-section-bg)] p-6 shadow-xl">
                        {/* HEADER */}
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                Other HRNs
                            </h2>

                            <button
                                onClick={() => setIsHRNModalOpen(false)}
                                className="text-xs font-bold text-red-500 hover:underline"
                            >
                                Close
                            </button>
                        </div>

                        {/* CURRENT HRN */}
                        <div className="mb-4">
                            <p className="text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                Main HRN
                            </p>
                            <p className="font-mono text-sm font-black text-[var(--patients-accent)]">
                                {patient.hrn}
                            </p>
                        </div>

                        {/* LIST */}
                        <div className="space-y-2">
                            {otherHRNs.length > 0 ? (
                                otherHRNs.map((h) => (
                                    <div
                                        key={h.id}
                                        className="flex items-center justify-between rounded border border-[var(--patients-border)] px-3 py-2 font-mono text-xs"
                                    >
                                        {h.hrn}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-[var(--patients-muted)] uppercase italic">
                                    No additional HRNs found
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ADD HRN */}
            {isAddHRNModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-[var(--patients-section-bg)] p-6 shadow-xl">
                        {/* HEADER */}
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                Add New HRN
                            </h2>

                            <button
                                onClick={() => setIsAddHRNModalOpen(false)}
                                className="text-xs font-bold text-red-500 hover:underline"
                            >
                                Close
                            </button>
                        </div>

                        {/* FORM */}
                        <form onSubmit={submitHRN} className="space-y-4">
                            {/* INPUT */}
                            <div>
                                <label className="text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                    New HRN
                                </label>
                                <input
                                    type="text"
                                    value={data.hrn}
                                    onChange={(e) =>
                                        setData('hrn', e.target.value)
                                    }
                                    className="mt-1 w-full rounded border border-[var(--patients-border)] bg-transparent px-3 py-2 font-mono text-sm focus:border-[var(--patients-accent)] focus:outline-none"
                                    placeholder="Enter HRN..."
                                    required
                                />

                                {errors.hrn && (
                                    <p className="mt-1 text-[10px] text-red-500">
                                        {errors.hrn}
                                    </p>
                                )}
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddHRNModalOpen(false)}
                                    className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase hover:underline"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[var(--patients-accent)] px-4 py-2 text-[10px] font-black text-white uppercase transition hover:brightness-90 disabled:opacity-50 dark:text-black"
                                >
                                    {processing ? 'Saving...' : 'Save HRN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    return isAdmin ? (
        <AppLayout breadcrumbs={breadcrumbs}>{pageContent}</AppLayout>
    ) : (
        pageContent
    );
}
