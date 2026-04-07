import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Header from '@/components/header';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import PatientArchive from './PatientArchive';
import { FileText, ImagePlus, Loader2 } from 'lucide-react';

import axios from 'axios';

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
    total?: number;
    pages?: { id: number; image_path: string; [key: string]: any }[];
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
    // --- State ---
    const [selectedRecord, setSelectedRecord] = useState<FileRecord | null>(
        null,
    );
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isHRNModalOpen, setIsHRNModalOpen] = useState(false);
    const [pdfVersion, setPdfVersion] = useState(0);

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState('OPD RECORD');
    const [search, setSearch] = useState('');

    const [categories, setCategories] = useState([
        'OPD RECORD',
        'LABORATORY',
        'RADIO',
    ]);

    const [editingHRNId, setEditingHRNId] = useState(null);
    const [editingValue, setEditingValue] = useState('');

    useEffect(() => {
        axios
            .get('/patients-record-types')
            .then((res) => setCategories(res.data))
            .catch((err) => console.error('Failed to fetch categories:', err));
    }, []);

    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<
        'success' | 'error'
    >('success');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [targetFileId, setTargetFileId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const isAdmin = auth.user.role === 'admin';
    const isStaff = auth.user.role === 'staff';

    const { data, setData, post, processing, reset, errors } = useForm({
        patient_id: patient.id,
        hrns: '',
    });

    const isDuplicateCategory = useMemo(() => {
        return records.data.some((record) =>
            record.file_name.toUpperCase().includes(selected.toUpperCase()),
        );
    }, [records.data, selected]);

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => setShowNotification(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    // --- Handlers ---
    const handleAddImage = (fileId: number) => {
        setTargetFileId(fileId);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !targetFileId) return;

        const selectedFiles = Array.from(files);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 102400 * 1024; // 100MB in bytes

        // 1. Check for unsupported types
        const hasUnsupported = selectedFiles.some(
            (file) => !allowedTypes.includes(file.type),
        );

        // 2. Check for oversized files
        const hasOversized = selectedFiles.some((file) => file.size > maxSize);

        if (hasUnsupported) {
            setNotificationMessage(
                'Unsupported file detected. Please upload only JPG, JPEG, or PNG images.',
            );
            setNotificationType('error');
            setShowNotification(true);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (hasOversized) {
            setNotificationMessage(
                'One or more images exceed the 100MB limit.',
            );
            setNotificationType('error');
            setShowNotification(true);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // If validation passes, proceed with upload
        setIsLoading(true);
        setUploadProgress(0);

        router.post(
            `/pdf/upload-image/${targetFileId}`,
            { images: selectedFiles },
            {
                forceFormData: true,
                onProgress: (progress) => {
                    if (progress && progress.percentage !== undefined) {
                        setUploadProgress(progress.percentage);
                    }
                },
                onSuccess: (page) => {
                    const updatedRecords = (
                        page.props.records as PaginatedRecords
                    ).data;
                    const freshRecord = updatedRecords.find(
                        (r) => r.id === targetFileId,
                    );

                    if (freshRecord) setSelectedRecord(freshRecord);

                    setNotificationMessage(
                        `${files.length} images appended to PDF!`,
                    );
                    setNotificationType('success');
                    setShowNotification(true);
                    setPdfVersion((v) => v + 1);
                },
                onError: (errors) => {
                    // This catches Laravel validation errors (like mimes or max)
                    const serverError = Object.values(errors)[0];
                    setNotificationMessage(
                        serverError || 'Upload failed. Check file integrity.',
                    );
                    setNotificationType('error');
                    setShowNotification(true);
                },
                onFinish: () => {
                    setIsLoading(false);
                    setUploadProgress(0);
                    setTargetFileId(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            },
        );
    };

    const handleCreateBlankPdf = () => {
        if (isDuplicateCategory) {
            setNotificationMessage(
                `A ${selected} record already exists for this patient.`,
            );
            setNotificationType('error');
            setShowNotification(true);
            return;
        }

        setIsLoading(true);
        router.post(
            `/pdf/create-blank`,
            { category: selected, records_id: patient.id },
            {
                onSuccess: (page) => {
                    const flash = (page.props as any).flash;
                    if (flash?.pdf_path && flash?.success !== false) {
                        window.open(flash.pdf_path, '_blank');
                    }
                    setNotificationMessage(
                        flash?.message || 'Processing complete.',
                    );
                    setNotificationType(
                        flash?.success === false ? 'error' : 'success',
                    );
                    setShowNotification(true);
                },
                onError: () => {
                    setNotificationMessage(
                        'An error occurred while creating the PDF.',
                    );
                    setNotificationType('error');
                    setShowNotification(true);
                },
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const submitHRN = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/patients/add-hrn`, {
            onSuccess: () => {
                reset('hrns');
                setNotificationMessage('HRN recorded successfully');
                setNotificationType('success');
                setShowNotification(true);
            },
        });
    };

    const handleDeleteImage = (pageId: number) => {
        if (!selectedRecord || !selectedRecord.pages) return;

        if (confirm('Remove this page from the PDF?')) {
            // 1. Instant UI Update (Optimistic)
            const updatedPages = selectedRecord.pages.filter(
                (p) => p.id !== pageId,
            );
            setSelectedRecord({
                ...selectedRecord,
                pages: updatedPages,
            });

            // 2. Server Request
            router.delete(`/pdf/delete-image/${pageId}`, {
                onSuccess: () => {
                    setPdfVersion((v) => v + 1); // Refresh PDF iframe
                    setNotificationMessage('Page removed. PDF updated.');
                    setNotificationType('success');
                    setShowNotification(true);
                },
                onError: () => {
                    setNotificationMessage('Failed to remove page.');
                    setNotificationType('error');
                    setShowNotification(true);
                },
                preserveScroll: true,
            });
        }
    };

    const labelClass =
        'text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Patient's Folder", href: '/viewer/record-finder' },
    ];

    const updateHRN = (id) => {
        router.put(
            `/hrns/${id}`,
            { hrn: editingValue },
            {
                onSuccess: () => {
                    setEditingHRNId(null);
                    setEditingValue('');
                },
            },
        );
    };

    const pageContent = (
        <div className="min-h-screen bg-[var(--patients-sidebar-bg)] text-[var(--patients-text)] transition-colors duration-200">
            <Head title={`${patient.lastname}'s Records`} />
            {!isAdmin && <Header />}

            {/* Hidden Multiple File Input */}
            <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {showNotification && (
                <div
                    className={`fixed top-5 left-5 z-[250] flex animate-in items-center gap-3 rounded-lg border-l-4 px-6 py-4 font-bold text-white shadow-2xl duration-300 slide-in-from-top-5 fade-in ${
                        notificationType === 'success'
                            ? 'border-green-500 bg-zinc-900'
                            : 'border-red-500 bg-zinc-900'
                    }`}
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] tracking-widest uppercase opacity-50">
                            System Message
                        </span>
                        <span className="text-sm tracking-tight">
                            {notificationMessage}
                        </span>
                    </div>
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
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                    {fromPage === 'add' ? 'Back to Add Page' : 'Back to Search'}
                </Link>

                <div className="mb-10 overflow-hidden rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)] shadow-sm">
                    <div className="border-b border-[var(--patients-border)] bg-[var(--patients-section-bg)] p-6 md:p-8">
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsHRNModalOpen(true)}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--button-border)] px-4 py-1.5 text-sm font-medium hover:border-[var(--button-border-hover)] dark:bg-gray-800"
                                    >
                                        Edit Patient
                                    </button>
                                    <button
                                        onClick={() => setIsHRNModalOpen(true)}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--button-border)] px-4 py-1.5 text-sm font-medium hover:border-[var(--button-border-hover)] dark:bg-gray-800"
                                    >
                                        View HRN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

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

                    <button
                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 bg-blue-600 py-3 text-[10px] font-black tracking-widest text-white uppercase hover:bg-blue-700"
                    >
                        {isInfoOpen
                            ? 'Hide Patient Information'
                            : 'View Patient Information'}
                    </button>
                </div>

                <PatientArchive
                    records={records}
                    otherFiles={records.data}
                    isAdmin={isAdmin}
                    isStaff={isStaff}
                    isLoading={isLoading}
                    open={open}
                    setOpen={setOpen}
                    selected={selected}
                    search={search}
                    setSearch={setSearch}
                    categories={categories}
                    openMenuId={openMenuId}
                    isDuplicate={isDuplicateCategory}
                    handleSelect={(v) => {
                        setSelected(v);
                        setSearch(v);
                        setOpen(false);
                        if (!categories.includes(v))
                            setCategories([...categories, v]);
                    }}
                    handleCreateBlankPdf={handleCreateBlankPdf}
                    handleToggleMenu={(e, id) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === id ? null : id);
                    }}
                    handleDeleteRecord={(id, name) =>
                        confirm(`Delete ${name}?`) &&
                        router.delete(`/pdf/delete-file/${id}`)
                    }
                    setSelectedRecord={setSelectedRecord}
                />
            </main>

            {/* HRN MODAL */}
            {isHRNModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-[var(--patients-section-bg)] p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                HRN Records
                            </h2>
                            <button
                                onClick={() => setIsHRNModalOpen(false)}
                                className="cursor-pointer text-xs font-bold text-red-500 hover:underline"
                            >
                                Close
                            </button>
                        </div>
                        <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                            <label
                                className={`${labelClass} mb-1 block opacity-60`}
                            >
                                Existing HRNs
                            </label>
                            {patient.hrns.map((h) => (
                                <div
                                    key={h.id}
                                    className={`flex items-center justify-between rounded border px-3 py-2 font-mono text-xs ${
                                        h.hrn === patient.hrn
                                            ? 'border-[var(--patients-accent)] bg-[var(--patients-accent)]/10'
                                            : 'border-[var(--patients-border)]'
                                    }`}
                                >
                                    {/* LEFT SIDE */}
                                    {editingHRNId === h.id ? (
                                        <input
                                            type="text"
                                            value={editingValue}
                                            onChange={(e) => {
                                                const val =
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    );
                                                if (val.length <= 15)
                                                    setEditingValue(val);
                                            }}
                                            className="w-full rounded border px-2 py-1 text-xs"
                                        />
                                    ) : (
                                        <span
                                            className={
                                                h.hrn === patient.hrn
                                                    ? 'font-black text-[var(--patients-accent)]'
                                                    : ''
                                            }
                                        >
                                            {h.hrn}
                                        </span>
                                    )}

                                    {/* RIGHT SIDE ACTIONS */}
                                    <div className="ml-2 flex items-center gap-2">
                                        {h.hrn === patient.hrn && (
                                            <span className="text-[8px] font-black text-[var(--patients-accent)] uppercase">
                                                Main
                                            </span>
                                        )}

                                        {(isAdmin || isStaff) && (
                                            <>
                                                {editingHRNId === h.id ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                updateHRN(h.id)
                                                            }
                                                            className="text-[9px] text-green-500 hover:underline"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setEditingHRNId(
                                                                    null,
                                                                )
                                                            }
                                                            className="text-[9px] text-gray-400 hover:underline"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingHRNId(
                                                                h.id,
                                                            );
                                                            setEditingValue(
                                                                h.hrn,
                                                            );
                                                        }}
                                                        className="text-[9px] text-blue-500 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {(isAdmin || isStaff) && (
                            <>
                                <div className="my-6 border-t border-dashed border-[var(--patients-border)]" />
                                <h2 className="mb-4 text-[10px] font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                    Register New HRN
                                </h2>
                                <form
                                    onSubmit={submitHRN}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className={labelClass}>
                                            HRN Number
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={data.hrns}
                                            onChange={(e) => {
                                                const val =
                                                    e.target.value.replace(
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
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full cursor-pointer bg-[var(--patients-accent)] px-4 py-2.5 text-[10px] font-black text-white uppercase transition-all hover:brightness-90 disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Processing...'
                                            : 'Add HRN Record'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* PDF VIEWER MODAL */}
            {selectedRecord && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm">
                    <div className="flex items-center justify-between bg-black p-4 text-white">
                        <h2 className="text-sm font-black uppercase">
                            {selectedRecord.file_name}
                        </h2>
                        <div className="flex items-center gap-4">
                            {/* File Support Indicator */}
                            <div className="flex items-center gap-4">
                                {(isAdmin || isStaff) && (
                                    <>
                                        {/* Supported Files Info */}
                                        <div className="hidden flex-col items-end border-r border-white/10 pr-4 md:flex">
                                            <span className="text-[8px] font-black tracking-[0.2em] text-white/40 uppercase">
                                                Supported Files
                                            </span>
                                            <span className="text-[9px] font-bold text-[var(--patients-accent)]">
                                                JPG, PNG, JPEG
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() =>
                                                handleAddImage(
                                                    selectedRecord.id,
                                                )
                                            }
                                            className="flex items-center gap-2 rounded bg-white/10 px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-blue-600"
                                        >
                                            <ImagePlus size={14} /> Add Image
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="cursor-pointer bg-red-600 px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-red-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        <div className="flex-1 bg-zinc-800">
                            <iframe
                                key={pdfVersion}
                                src={`${selectedRecord.pdf_url}?v=${pdfVersion}#toolbar=1`}
                                className="h-full w-full border-none"
                            />
                        </div>

                        {/* CORRECTED RIGHT SIDEBAR */}
                        {(isAdmin || isStaff) && (
                            <div className="hidden w-72 overflow-y-auto border-l border-white/10 bg-black/50 p-4 md:block">
                                <h3 className="mb-4 text-[9px] font-black tracking-widest text-white/40 uppercase">
                                    PDF Pages
                                </h3>
                                <div className="space-y-4">
                                    {selectedRecord.pages?.map((page, idx) => {
                                        // Detect if this is a valid image or a placeholder
                                        const isBrokenImage =
                                            !page.image_path ||
                                            page.image_path.endsWith('/');

                                        return (
                                            <div
                                                key={page.id}
                                                className="group relative rounded border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
                                            >
                                                <div className="mb-2 flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded bg-zinc-900">
                                                    {!isBrokenImage ? (
                                                        <img
                                                            src={
                                                                page.image_path
                                                            }
                                                            alt={`Page ${idx + 1}`}
                                                            className="h-full w-full object-cover opacity-80 group-hover:opacity-100"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-white/20">
                                                            <FileText
                                                                size={32}
                                                            />
                                                            <span className="text-[9px] font-black uppercase">
                                                                Cover Page
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-bold text-white/30">
                                                        PAGE {idx + 1}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteImage(
                                                                page.id,
                                                            )
                                                        }
                                                        className="cursor-pointer text-[9px] font-black text-red-500 uppercase hover:text-red-400"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Upload Progress Overlay */}
            {isLoading && uploadProgress > 0 && (
                <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6">
                        <div className="mb-2 flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black tracking-widest text-white uppercase opacity-60">
                                    Uploading Files
                                </span>
                                <span className="text-lg font-bold text-white">
                                    {uploadProgress === 100
                                        ? 'Processing...'
                                        : `${uploadProgress}% Complete`}
                                </span>
                            </div>
                            <Loader2
                                className="animate-spin text-[var(--patients-accent)]"
                                size={24}
                            />
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-[var(--patients-accent)] transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="mt-3 text-center text-[10px] font-bold tracking-tighter text-white/40 uppercase">
                            Please do not close the tab while optimizing and
                            merging images...
                        </p>
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
