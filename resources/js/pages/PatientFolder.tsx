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

    // Change these lines in your State section:
    const [editingHRNId, setEditingHRNId] = useState<number | 'primary' | null>(
        null,
    );
    const [editingValue, setEditingValue] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const editForm = useForm({
        firstname: patient.firstname || '',
        lastname: patient.lastname || '',
        middlename: patient.middlename || '',
        hrn: patient.hrn || '',
        sex: (patient as any).information?.sex || 'Male',
        civil_status: patient.information?.civil_status || '',
        nationality: patient.information?.nationality || '',
        birthdate: patient.information?.birthdate || '',
        place_of_birth: patient.information?.place_of_birth || '',
        phone_number: patient.information?.phone_number || '',
        religion: patient.information?.religion || '',
        street: patient.information?.address?.street || '',
        barangay: patient.information?.address?.barangay || '',
        municipality: patient.information?.address?.municipality || '',
        province: patient.information?.address?.province || '',
    });

    const handleUpdatePatient = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/patients/${patient.id}`, {
            onSuccess: () => {
                // setIsEditModalOpen(false);
                setNotificationMessage('Patient details updated.');
                setNotificationType('success');
                setShowNotification(true);
            },
        });
    };

    useEffect(() => {
        axios
            .get('/patients-record-types')
            .then((res) => setCategories(res.data))
            .catch((err) => console.error('Failed to fetch categories:', err));
    }, []);

    useEffect(() => {
        if (isEditModalOpen) {
            editForm.reset();
        }
    }, [isEditModalOpen]);

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

    const handleupdateHRN = (id: number) => {
        router.put(
            `/hrns/${id}`,
            { hrn: editingValue },
            {
                preserveScroll: true, // Keep the user's place in the modal
                onSuccess: () => {
                    setEditingHRNId(null);
                    setEditingValue('');

                    // Show a success notification
                    setNotificationMessage('HRN updated successfully');
                    setNotificationType('success');
                    setShowNotification(true);
                },
                onError: (err) => {
                    setNotificationMessage(
                        (Object.values(err)[0] as string) || 'Update failed',
                    );
                    setNotificationType('error');
                    setShowNotification(true);
                },
            },
        );
    };

    const updatePrimaryHRN = (id: number) => {
        router.put(
            `/primary/update/${id}`,
            { hrn: editingValue },
            {
                preserveScroll: true, // Keep the user's place in the modal
                onSuccess: () => {
                    setEditingHRNId(null);
                    setEditingValue('');

                    // Show a success notification
                    setNotificationMessage('Primary HRN updated successfully');
                    setNotificationType('success');
                    setShowNotification(true);
                },
                onError: (err) => {
                    setNotificationMessage(
                        (Object.values(err)[0] as string) || 'Update failed',
                    );
                    setNotificationType('error');
                    setShowNotification(true);
                },
            },
        );
    };

    const labelClass =
        'text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Patient's Folder", href: '/viewer/record-finder' },
    ];
    const calculateAge = (birthdate: string | undefined) => {
        if (!birthdate) return 'N/A';
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
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
                    className={`fixed top-4 right-4 z-[250] transform transition-all duration-500 md:top-24 md:right-8 ${
                        showNotification
                            ? 'translate-x-0 opacity-100'
                            : 'pointer-events-none translate-x-full opacity-0'
                    }`}
                >
                    <div className="flex items-center gap-4 rounded border border-[var(--patients-border)] bg-[var(--patients-section-bg)] p-4 shadow-xl">
                        {/* Dynamic Icon Circle */}
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg dark:text-black ${
                                notificationType === 'success'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }`}
                        >
                            {notificationType === 'success' ? (
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
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
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
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            )}
                        </div>

                        {/* Text Content */}
                        <div>
                            <h4 className="text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                System Message
                            </h4>
                            <p className="text-sm font-bold text-[var(--patients-text)]">
                                {notificationMessage}
                            </p>
                        </div>
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
                                    {(isAdmin || isStaff) && (
                                        <button
                                            onClick={() =>
                                                setIsEditModalOpen(true)
                                            }
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--button-border)] px-4 py-1.5 text-sm font-medium hover:border-[var(--button-border-hover)] dark:bg-gray-800"
                                        >
                                            Edit Patient
                                        </button>
                                    )}

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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={labelClass}>Birthday</p>
                                        <p className="text-sm font-black uppercase">
                                            {patient.information?.birthdate
                                                ? new Date(
                                                      patient.information
                                                          .birthdate,
                                                  ).toLocaleDateString(
                                                      'en-US',
                                                      {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : 'NOT PROVIDED'}
                                        </p>
                                    </div>
                                    {/* AUTO COMPUTE AGE & DISPLAY SEX */}
                                    <div>
                                        <p className={labelClass}>Sex / Age</p>
                                        <p className="text-sm font-black uppercase">
                                            {(patient as any).information
                                                ?.sex || 'N/A'}
                                            <span className="mx-2 text-[var(--patients-muted)]">
                                                |
                                            </span>
                                            {calculateAge(
                                                patient.information?.birthdate,
                                            )}{' '}
                                        </p>
                                    </div>
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
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    {/* Added 'max-h-[90vh]' and 'flex flex-col' to the main card */}
                    <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-[var(--patients-section-bg)] shadow-xl">
                        {/* Header: Kept outside the scroll area so it's always visible */}
                        <div className="flex items-center justify-between border-b border-[var(--patients-border)] p-6">
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

                        {/* Scrollable Content Area */}
                        <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
                            {/* PRIMARY HRN SECTION */}
                            <div className="mb-6">
                                <label
                                    className={`${labelClass} mb-2 block opacity-60`}
                                >
                                    Primary HRN
                                </label>

                                <div
                                    className={`flex items-center justify-between rounded border px-3 py-3 font-mono text-sm ${
                                        editingHRNId === 'primary'
                                            ? 'border-blue-500 bg-blue-500/5'
                                            : 'border-[var(--patients-accent)] bg-[var(--patients-accent)]/10'
                                    }`}
                                >
                                    {editingHRNId === 'primary' ? (
                                        <div className="flex w-full flex-col gap-2">
                                            <input
                                                type="text"
                                                value={editingValue}
                                                autoFocus
                                                onChange={(e) => {
                                                    const val =
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            '',
                                                        );
                                                    if (val.length <= 15)
                                                        setEditingValue(val);
                                                }}
                                                className="w-full rounded border border-blue-500 bg-[var(--background)] px-2 py-1 text-[var(--patients-text)] outline-none"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        updatePrimaryHRN(
                                                            patient.id,
                                                        )
                                                    }
                                                    className="cursor-pointer text-[10px] font-black text-green-500 uppercase hover:underline"
                                                >
                                                    Save Primary
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setEditingHRNId(null)
                                                    }
                                                    className="cursor-pointer text-[10px] font-black text-gray-400 uppercase hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-black text-[var(--patients-accent)]">
                                                {patient.hrn}
                                            </span>
                                            {(isAdmin || isStaff) && (
                                                <button
                                                    onClick={() => {
                                                        setEditingHRNId(
                                                            'primary',
                                                        );
                                                        setEditingValue(
                                                            patient.hrn,
                                                        );
                                                    }}
                                                    className="cursor-pointer text-[10px] font-black text-blue-500 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="my-4 border-t border-[var(--patients-border)]" />

                            {/* SECONDARY HRNS SECTION */}
                            <label
                                className={`${labelClass} mb-2 block opacity-60`}
                            >
                                Linked HRNs (Alias/Previous)
                            </label>

                            <div className="space-y-2">
                                {patient.hrns && patient.hrns.length > 0 ? (
                                    patient.hrns.map((h) => (
                                        <div
                                            key={h.id}
                                            className="flex items-center justify-between rounded border border-[var(--patients-border)] px-3 py-2 font-mono text-xs transition-colors hover:bg-white/5"
                                        >
                                            {editingHRNId === h.id ? (
                                                <input
                                                    type="text"
                                                    value={editingValue}
                                                    autoFocus
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                '',
                                                            );
                                                        if (val.length <= 15)
                                                            setEditingValue(
                                                                val,
                                                            );
                                                    }}
                                                    className="w-full rounded border border-[var(--patients-accent)] bg-[var(--background)] px-2 py-1 text-xs text-[var(----patients-text)] outline-none"
                                                />
                                            ) : (
                                                <span>{h.hrn}</span>
                                            )}
                                            <div className="ml-2 flex items-center gap-2">
                                                {(isAdmin || isStaff) &&
                                                    (editingHRNId === h.id ? (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleupdateHRN(
                                                                        h.id,
                                                                    )
                                                                }
                                                                className="text-[9px] font-bold text-green-500 cursor-pointer hover:underline"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setEditingHRNId(
                                                                        null,
                                                                    )
                                                                }
                                                                className="text-[9px] font-bold text-gray-400 cursor-pointer hover:underline"
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
                                                            className="text-[9px] font-bold text-blue-500 cursor-pointer hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-[10px] text-[var(--patients-muted)] italic">
                                        No secondary HRNs found.
                                    </p>
                                )}
                            </div>

                            {/* REGISTER NEW HRN FORM */}
                            {(isAdmin || isStaff) && (
                                <>
                                    <div className="my-6 border-t border-dashed border-[var(--patients-border)]" />
                                    <h2 className="mb-4 text-[10px] font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                        Register New Alias HRN
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
                                            className="flex cursor-pointer items-center gap-2 rounded bg-white/10 px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-blue-600"
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

            {/* Edit MODAL */}
            {(isAdmin || isStaff) && isEditModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)] shadow-2xl">
                        <form onSubmit={handleUpdatePatient} className="p-8">
                            {/* Header */}
                            <div className="mb-10 flex items-center justify-between border-b border-[var(--patients-border)] pb-6">
                                <h2 className="text-xl font-black tracking-widest text-[var(--patients-accent)] uppercase">
                                    Edit Patient Folder
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => {
                                        editForm.reset();
                                        setIsEditModalOpen(false);
                                    }}
                                    className="cursor-pointer text-[10px] font-black text-red-500 uppercase hover:underline"
                                >
                                    Close Window
                                </button>
                            </div>

                            {/* Identity Header (Names) */}
                            <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                                {(
                                    [
                                        { label: 'Last Name', key: 'lastname' },
                                        {
                                            label: 'First Name',
                                            key: 'firstname',
                                        },
                                        {
                                            label: 'Middle Name',
                                            key: 'middlename',
                                        },
                                    ] as const
                                ) // This tells TS these strings are specific keys, not just any string
                                    .map((field) => (
                                        <div
                                            key={field.key}
                                            className="space-y-1"
                                        >
                                            <label className="text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                                {field.label}
                                            </label>
                                            <input
                                                className="w-full border border-[var(--patients-border)] bg-[var(--background)] p-3 text-lg font-black text-[var(--patients-text)] uppercase outline-none focus:border-[var(--patients-accent)]"
                                                // Type assertion here tells TS that field.key is a safe property of editForm.data
                                                value={
                                                    editForm.data[
                                                        field.key as keyof typeof editForm.data
                                                    ]
                                                }
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        field.key as any, // 'any' or the specific union type fixes the setData error
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                            </div>

                            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                                {/* SECTION 1: CONTACT & STATUS */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 bg-[var(--patients-accent)]" />
                                        <h3 className="text-[11px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                            Contact & Status
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                                Phone
                                            </label>
                                            <input
                                                className="w-full border-b border-[var(--patients-border)] bg-transparent pb-1 text-sm font-black text-[var(--patients-text)] outline-none focus:border-[var(--patients-accent)]"
                                                value={
                                                    editForm.data.phone_number
                                                }
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'phone_number',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(
                                                [
                                                    'civil_status',
                                                    'nationality',
                                                ] as const
                                            ).map((field) => (
                                                <div key={field}>
                                                    <label className="mb-1 block text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                                        {field.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </label>
                                                    <input
                                                        className="w-full border border-[var(--patients-border)] bg-transparent p-2 text-[10px] font-black text-[var(--patients-text)] uppercase outline-none focus:border-[var(--patients-accent)]"
                                                        value={
                                                            editForm.data[field]
                                                        } // Now TS knows 'field' is a valid key
                                                        onChange={(e) =>
                                                            editForm.setData(
                                                                field,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: BIRTH & RELIGION */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 bg-[var(--patients-accent)]" />
                                        <h3 className="text-[11px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                            Birth & Religion
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                                Birthday
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border-b border-[var(--patients-border)] bg-transparent pb-1 text-sm font-black text-[var(--patients-text)] [color-scheme:dark] outline-none focus:border-[var(--patients-accent)]"
                                                value={editForm.data.birthdate}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'birthdate',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                                Religion
                                            </label>
                                            <input
                                                className="w-full border-b border-[var(--patients-border)] bg-transparent pb-1 text-sm font-black text-[var(--patients-text)] uppercase outline-none focus:border-[var(--patients-accent)]"
                                                value={editForm.data.religion}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'religion',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                                Biological Sex
                                            </label>
                                            <select
                                                className="w-full border-b border-[var(--patients-border)] bg-transparent pb-1 text-sm font-black text-[var(--patients-text)] uppercase outline-none"
                                                value={editForm.data.sex}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'sex',
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option
                                                    value="Male"
                                                    className="bg-[var(--patients-section-bg)]"
                                                >
                                                    Male
                                                </option>
                                                <option
                                                    value="Female"
                                                    className="bg-[var(--patients-section-bg)]"
                                                >
                                                    Female
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: FULL ADDRESS */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 bg-[var(--patients-accent)]" />
                                        <h3 className="text-[11px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                            Full Address
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                                                Street / House No.
                                            </label>
                                            <input
                                                className="w-full border-b border-[var(--patients-border)] bg-transparent pb-1 text-sm font-black text-[var(--patients-text)] uppercase outline-none focus:border-[var(--patients-accent)]"
                                                value={editForm.data.street}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'street',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Using 'as const' here solves the indexing error */}
                                        {(
                                            [
                                                'barangay',
                                                'municipality',
                                                'province',
                                            ] as const
                                        ).map((loc) => (
                                            <div
                                                key={loc}
                                                className="grid grid-cols-[60px_1fr] items-center gap-2"
                                            >
                                                <label className="text-[10px] font-black text-[var(--patients-muted)] uppercase">
                                                    {loc.substring(0, 4)}:
                                                </label>
                                                <input
                                                    className="border-b border-[var(--patients-border)] bg-transparent pb-1 text-left text-xs font-black text-[var(--patients-text)] uppercase outline-none focus:border-[var(--patients-accent)]"
                                                    value={editForm.data[loc]}
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            loc as any,
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="mt-12 flex justify-end gap-3 border-t border-[var(--patients-border)] pt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        editForm.reset(); // Reverts to the initial props (patient data)
                                        setIsEditModalOpen(false); // Closes the modal
                                    }}
                                    className="cursor-pointer px-6 py-2 text-[10px] font-black text-[var(--patients-muted)] uppercase transition-colors hover:text-[var(--patients-text)]"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="cursor-pointer bg-[var(--button-bg)] px-10 py-3 text-[10px] font-black text-[var(--button-text)] uppercase shadow-lg transition-all hover:bg-[var(--button-hover-bg)] disabled:opacity-50"
                                >
                                    {editForm.processing
                                        ? 'Syncing...'
                                        : 'Update Records'}
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
