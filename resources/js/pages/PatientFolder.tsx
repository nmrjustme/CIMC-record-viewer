import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Header from '@/components/header';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { MoreVertical, ImagePlus, Trash2 } from 'lucide-react';

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
    auth: { user: { role: string; id: number } };
    fromPage: 'search' | 'add';
    flash?: { pdf_path?: string };
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
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isAddHRNModalOpen, setIsAddHRNModalOpen] = useState(false);
    const [isHRNModalOpen, setIsHRNModalOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState('OPD RECORD');
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([
        'OPD RECORD',
        'LABORATORY',
        'RADIO',
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<
        'success' | 'error'
    >('success');

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // --- Close menu on click outside ---
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId !== null) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);

    const handleToggleMenu = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // 1. Add these at the top of your component state
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [targetFileId, setTargetFileId] = useState<number | null>(null);

    // 2. Update handleAddImage to trigger the file explorer
    const handleAddImage = (fileId: number) => {
        setTargetFileId(fileId);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 3. Create the upload handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !targetFileId) return;

        setIsLoading(true);
        // Send as multipart/form-data
        router.post(
            `/pdf/upload-image/${targetFileId}`,
            {
                image: file,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    setNotificationMessage('Image added and PDF updated!');
                    setNotificationType('success');
                    setShowNotification(true);
                },
                onError: () => {
                    setNotificationMessage('Failed to upload image.');
                    setNotificationType('error');
                    setShowNotification(true);
                },
                onFinish: () => {
                    setIsLoading(false);
                    setTargetFileId(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            },
        );
    };

    const handleDeleteRecord = (fileId: number, fileName: string) => {
        if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            router.delete(`/records/${fileId}`, {
                onSuccess: () => {
                    setNotificationType('success');
                    setNotificationMessage('Record deleted successfully');
                    setShowNotification(true);
                },
                onError: () => {
                    setNotificationType('error');
                    setNotificationMessage('Failed to delete record');
                    setShowNotification(true);
                },
            });
        }
    };

    const handleSelect = (value: string) => {
        setSelected(value);
        setSearch(value);
        setOpen(false);
        if (!categories.includes(value)) {
            setCategories([...categories, value]);
        }
    };

    const handleDownloadArchive = () => {
        window.location.href = `/patients/${patient.id}/generate-archive-pdf`;
    };

    const handleCreateBlankPdf = () => {
        setIsLoading(true);
        router.post(
            `/pdf/create-blank`,
            {
                category: selected,
                records_id: patient.id,
            },
            {
                onSuccess: (page) => {
                    const flash = page.props.flash as { pdf_path?: string };
                    if (flash?.pdf_path) {
                        window.open(flash.pdf_path, '_blank');
                    }
                    setNotificationType('success');
                    setNotificationMessage('PDF successfully created!');
                    setShowNotification(true);
                },
                onError: (errors: any) => {
                    setNotificationType('error');
                    setNotificationMessage(
                        errors.create_pdf || 'Failed to create PDF.',
                    );
                    setShowNotification(true);
                },
                onFinish: () => {
                    setIsLoading(false);
                    setTimeout(() => setShowNotification(false), 4000);
                },
            },
        );
    };

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
        patient_id: patient.id,
        hrns: '',
    });

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
        post(`/patients/add-hrn`, {
            onSuccess: () => {
                reset();
                setIsAddHRNModalOpen(false);
            },
        });
    };

    const labelClass =
        'text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase';
    const sectionTitle =
        'mb-4 text-[10px] font-black tracking-[0.2em] text-[var(--patients-accent)] uppercase';

    const pageContent = (
        <div className="min-h-screen bg-[var(--patients-sidebar-bg)] text-[var(--patients-text)] transition-colors duration-200">
            <Head title={`${patient.lastname}'s Records`} />
            {!isAdmin && <Header />}
            {/* Hidden File Input for Image Upload */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
            {showNotification && (
                <div
                    className={`fixed top-5 right-5 z-[200] rounded-md px-6 py-3 font-bold text-white shadow-lg transition-all ${notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                >
                    {notificationMessage}
                </div>
            )}
            <main className="mx-auto w-full p-6">
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

                <div className="mb-10 overflow-hidden rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)]">
                    <div className="border-b border-[var(--patients-border)] bg-black/10 p-6 md:p-8 dark:bg-black/40">
                        <div className="flex flex-col justify-between gap-6 md:flex-row">
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

                            <div className="flex flex-col items-end gap-1.5 text-right">
                                <p className="font-mono text-lg tracking-widest text-[var(--patients-muted)] uppercase">
                                    HRN:{' '}
                                    <span className="font-bold text-[var(--patients-accent)]">
                                        {patient.hrn}
                                    </span>
                                </p>
                                <div className="flex items-center gap-2">
                                    {(isAdmin || isStaff) && (
                                        <button
                                            onClick={() =>
                                                setIsAddHRNModalOpen(true)
                                            }
                                            className="hover:bg-opacity-90 flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--patients-accent)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line
                                                    x1="12"
                                                    y1="5"
                                                    x2="12"
                                                    y2="19"
                                                ></line>
                                                <line
                                                    x1="5"
                                                    y1="12"
                                                    x2="19"
                                                    y2="12"
                                                ></line>
                                            </svg>
                                            <span>Add</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsHRNModalOpen(true)}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-[var(--patients-accent)] hover:text-[var(--patients-accent)] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                            ></circle>
                                        </svg>
                                        <span>View More</span>
                                    </button>
                                </div>
                                <span className="mt-1 px-1 text-[10px] font-black tracking-widest text-[var(--patients-accent)] uppercase opacity-60">
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
                        <div className="flex flex-col border-b border-[var(--patients-border)] p-6 md:border-r md:border-b-0">
                            <h4
                                className={`${labelClass} mb-4 flex items-center gap-2`}
                            >
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" />{' '}
                                Contact & Status
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className={labelClass}>Phone</p>
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
                        <div className="flex flex-col border-b border-[var(--patients-border)] p-6 md:border-r md:border-b-0">
                            <h4
                                className={`${labelClass} mb-4 flex items-center gap-2`}
                            >
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" />{' '}
                                Birth & Religion
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className={labelClass}>Birthday</p>
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
                                    <p className={labelClass}>Religion</p>
                                    <p className="text-sm font-bold text-[var(--patients-muted)] uppercase">
                                        {patient.information?.religion ||
                                            'None specified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col p-6">
                            <h4
                                className={`${labelClass} mb-4 flex items-center gap-2`}
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
                                        <span>Created:</span>{' '}
                                        <span className="font-mono">
                                            {new Date(
                                                latestFile.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-x-2 text-[10px] font-black text-[var(--patients-accent)] uppercase sm:justify-start">
                                        <span className="h-1.5 w-1.5 animate-pulse bg-[var(--patients-accent)]" />
                                        <span>Updated:</span>{' '}
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

                <section className="pb-20">
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
                                        className={`${sectionTitle} cursor-pointer rounded border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white`}
                                    >
                                        {search || selected} ▾
                                    </button>
                                    {open && (
                                        <div className="absolute left-0 z-50 mt-2 w-64 rounded border border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-black">
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                placeholder="Type or select..."
                                                className="w-full border-b px-3 py-2 outline-none dark:bg-black"
                                            />
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
                                                            className="block w-full px-4 py-2 text-left text-blue-500 hover:bg-gray-100"
                                                        >
                                                            Add "{search}"
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleCreateBlankPdf}
                                    disabled={isLoading}
                                    className={`${sectionTitle} cursor-pointer rounded border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50`}
                                >
                                    {isLoading ? 'Creating...' : 'Create PDF'}
                                </button>
                                <button
                                    onClick={handleDownloadArchive}
                                    className="mb-4 flex cursor-pointer items-center gap-2 rounded border border-[var(--patients-accent)] bg-[var(--patients-accent)] px-4 py-2 text-[10px] font-black tracking-widest text-white transition-all hover:brightness-90 active:scale-95 dark:text-black"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line
                                            x1="12"
                                            y1="15"
                                            x2="12"
                                            y2="3"
                                        ></line>
                                    </svg>
                                    Download Archive
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
                                    {/* Action Menu Trigger */}
                                    <button
                                        onClick={(e) =>
                                            handleToggleMenu(e, file.id)
                                        }
                                        className="absolute top-2 right-2 p-1 text-[var(--patients-muted)] hover:text-[var(--patients-accent)]"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openMenuId === file.id && (
                                        <div className="absolute top-8 right-2 z-20 w-36 animate-in overflow-hidden rounded-md border border-[var(--patients-border)] bg-[var(--patients-section-bg)] shadow-xl duration-150 fade-in zoom-in">
                                            <div className="py-1">
                                                {isStaff && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddImage(
                                                                file.id,
                                                            );
                                                        }}
                                                        className="flex w-full items-center px-4 py-2 text-[9px] font-black text-[var(--patients-muted)] uppercase hover:bg-[var(--patients-accent)] hover:text-white"
                                                    >
                                                        <ImagePlus
                                                            size={14}
                                                            className="mr-2"
                                                        />{' '}
                                                        Add Image
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddImage(
                                                                    file.id,
                                                                );
                                                            }}
                                                            className="flex w-full items-center px-4 py-2 text-[9px] font-black text-[var(--patients-muted)] uppercase hover:bg-[var(--patients-accent)] hover:text-white"
                                                        >
                                                            <ImagePlus
                                                                size={14}
                                                                className="mr-2"
                                                            />{' '}
                                                            Add Image
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteRecord(
                                                                    file.id,
                                                                    file.file_name,
                                                                );
                                                            }}
                                                            className="flex w-full items-center px-4 py-2 text-[9px] font-black text-red-500 uppercase hover:bg-red-500 hover:text-white"
                                                        >
                                                            <Trash2
                                                                size={14}
                                                                className="mr-2"
                                                            />{' '}
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                                {!isAdmin && !isStaff && (
                                                    <div className="px-4 py-2 text-[8px] font-black uppercase italic">
                                                        No Actions
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

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

                    {records.links.length > 3 && (
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-1">
                            {records.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`flex h-10 min-w-[40px] items-center justify-center rounded px-3 text-[10px] font-black uppercase transition-all ${link.active ? 'bg-[var(--patients-accent)] text-white shadow-md' : link.url ? 'border border-[var(--patients-border)] bg-[var(--patients-section-bg)] text-[var(--patients-muted)] hover:border-[var(--patients-accent)] hover:text-[var(--patients-text)]' : 'cursor-not-allowed opacity-20'}`}
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
                            className="cursor-pointer bg-red-600 px-4 py-2 text-[10px] font-black tracking-widest text-white uppercase hover:bg-red-700"
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
            {/* --- OTHER HRN MODAL --- */}
            {isHRNModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-[var(--patients-section-bg)] p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                Other HRNs
                            </h2>
                            <button
                                onClick={() => setIsHRNModalOpen(false)}
                                className="cursor-pointer text-xs font-bold text-red-500 hover:underline"
                            >
                                Close
                            </button>
                        </div>
                        <div className="space-y-2">
                            {patient.hrns && patient.hrns.length > 0 ? (
                                [...patient.hrns].map((h) => (
                                    <div
                                        key={h.id}
                                        className={`flex items-center justify-between rounded border px-3 py-2 font-mono text-xs ${h.hrn === patient.hrn ? 'border-[var(--patients-accent)] bg-[var(--patients-accent)]/10' : 'border-[var(--patients-border)]'}`}
                                    >
                                        <span
                                            className={
                                                h.hrn === patient.hrn
                                                    ? 'font-black text-[var(--patients-accent)]'
                                                    : ''
                                            }
                                        >
                                            {h.hrn}
                                        </span>
                                        {h.hrn === patient.hrn && (
                                            <span className="text-[8px] font-black text-[var(--patients-accent)] uppercase">
                                                Main
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] uppercase italic">
                                    No additional HRNs
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* --- ADD HRN MODAL --- */}
            {isAddHRNModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-[var(--patients-section-bg)] p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                Add New HRN
                            </h2>
                            <button
                                onClick={() => setIsAddHRNModalOpen(false)}
                                className="cursor-pointer text-xs font-bold text-red-500 hover:underline"
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={submitHRN} className="space-y-4">
                            <div>
                                <label className={labelClass}>New HRN</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={data.hrns}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(
                                            /\D/g,
                                            '',
                                        );
                                        if (val.length <= 15)
                                            setData('hrns', val);
                                    }}
                                    className="mt-1 w-full rounded border border-[var(--patients-border)] bg-transparent px-3 py-2 font-mono text-sm focus:border-[var(--patients-accent)] focus:outline-none"
                                    placeholder="Enter 15-digit HRN..."
                                    required
                                />
                                <div className="mt-1 flex justify-between">
                                    {errors.hrns && (
                                        <p className="text-[10px] font-bold text-red-500 uppercase">
                                            {errors.hrns}
                                        </p>
                                    )}
                                    <span
                                        className={`text-[9px] uppercase ${data.hrns.length === 15 ? 'text-green-500' : 'text-gray-400'}`}
                                    >
                                        {data.hrns.length} / 15
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddHRNModalOpen(false)}
                                    className="cursor-pointer px-4 py-2 text-[10px] font-black text-gray-500 uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="cursor-pointer bg-[var(--patients-accent)] px-4 py-2 text-[10px] font-black text-white uppercase hover:brightness-90 disabled:opacity-50"
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
