import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Header from '@/components/header';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import PatientArchive from './PatientArchive';
import { ImagePlus } from 'lucide-react';

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
    const [selectedRecord, setSelectedRecord] = useState<FileRecord | null>(null);
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
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [targetFileId, setTargetFileId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isAdmin = auth.user.role === 'admin';
    const isStaff = auth.user.role === 'staff';

    const { data, setData, post, processing, reset, errors } = useForm({
        patient_id: patient.id,
        hrns: '',
    });

    // --- Memoized Duplicate Check ---
    const isDuplicateCategory = useMemo(() => {
        return records.data.some((record) =>
            record.file_name.toUpperCase().includes(selected.toUpperCase()),
        );
    }, [records.data, selected]);

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => setShowNotification(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    // --- Handlers ---
    const handleAddImage = (fileId: number) => {
        setTargetFileId(fileId);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !targetFileId) return;
        setIsLoading(true);
        router.post(
            `/pdf/upload-image/${targetFileId}`,
            { image: file },
            {
                forceFormData: true,
                onSuccess: () => {
                    setNotificationMessage('Image appended to PDF!');
                    setNotificationType('success');
                    setShowNotification(true);
                    setPdfVersion((v) => v + 1);
                },
                onFinish: () => {
                    setIsLoading(false);
                    setTargetFileId(null);
                },
            },
        );
    };

    const handleCreateBlankPdf = () => {
        if (isDuplicateCategory) {
            setNotificationMessage(`A ${selected} record already exists for this patient.`);
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
                    setNotificationMessage(flash?.message || 'Processing complete.');
                    setNotificationType(flash?.success === false ? 'error' : 'success');
                    setShowNotification(true);
                },
                onError: () => {
                    setNotificationMessage('An error occurred while creating the PDF.');
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

    const labelClass = 'text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Patient's Folder", href: '/viewer/record-finder' },
    ];

    const pageContent = (
        <div className="min-h-screen bg-[var(--patients-sidebar-bg)] text-[var(--patients-text)] transition-colors duration-200">
            <Head title={`${patient.lastname}'s Records`} />
            {!isAdmin && <Header />}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Notification Toast */}
            {showNotification && (
                <div className={`fixed top-5 right-5 z-[250] flex animate-in items-center gap-3 rounded-lg border-l-4 px-6 py-4 font-bold text-white shadow-2xl duration-300 slide-in-from-right-5 fade-in ${notificationType === 'success' ? 'border-green-500 bg-zinc-900' : 'border-red-500 bg-zinc-900'}`}>
                    <div className="flex flex-col">
                        <span className="text-[10px] tracking-widest uppercase opacity-50">System Message</span>
                        <span className="text-sm tracking-tight">{notificationMessage}</span>
                    </div>
                </div>
            )}

            <main className="mx-auto w-full p-6">
                <Link
                    href={fromPage === 'add' ? '/patients/create' : '/viewer/record-finder'}
                    className="mb-6 inline-flex items-center gap-2 text-xs font-black tracking-widest text-[var(--patients-muted)] uppercase transition-colors hover:text-[var(--patients-accent)]"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                    {fromPage === 'add' ? 'Back to Add Page' : 'Back to Search'}
                </Link>

                {/* Patient Header Card */}
                <div className="mb-10 overflow-hidden rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)] shadow-sm">
                    <div className="border-b border-[var(--patients-border)] bg-[var(--patients-section-bg)] p-6 md:p-8">
                        <div className="flex flex-col justify-between gap-6 md:flex-row">
                            <div className="flex flex-wrap gap-x-12 gap-y-6">
                                {[
                                    { label: 'Last Name', value: patient.lastname },
                                    { label: 'First Name', value: patient.firstname },
                                    { label: 'Middle Name', value: patient.middlename },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <h1 className="text-2xl font-black tracking-tight uppercase md:text-3xl">
                                            {item.value || '---'}
                                        </h1>
                                        <div className="mt-1 h-1 w-full bg-[var(--patients-accent)] opacity-30" />
                                        <span className={`${labelClass} mt-2`}>{item.label}</span>
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
                                <button
                                    onClick={() => setIsHRNModalOpen(true)}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--button-border)] px-4 py-1.5 text-sm font-medium hover:border-[var(--button-border-hover)] dark:bg-gray-800"
                                >
                                    View HRN
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Patient Info Toggle Area */}
                    <div className={`grid grid-cols-1 transition-all duration-300 ease-in-out md:grid-cols-3 ${isInfoOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
                        <div className="flex flex-col border-b border-[var(--patients-border)] p-6 md:border-r md:border-b-0">
                            <h4 className={`${labelClass} mb-4 flex items-center gap-2`}>
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" /> Contact & Status
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className={labelClass}>Phone</p>
                                    <p className="font-mono text-sm font-black">{patient.information?.phone_number || 'UNLISTED'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="border border-[var(--patients-border)] px-2 py-0.5 text-[10px] font-bold uppercase">{patient.information?.civil_status || 'Unknown'}</span>
                                    <span className="border border-[var(--patients-border)] px-2 py-0.5 text-[10px] font-bold uppercase">{patient.information?.nationality || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col border-b border-[var(--patients-border)] p-6 md:border-r md:border-b-0">
                            <h4 className={`${labelClass} mb-4 flex items-center gap-2`}>
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" /> Birth & Religion
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className={labelClass}>Birthday</p>
                                    <p className="text-sm font-black uppercase">
                                        {patient.information?.birthdate ? new Date(patient.information.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'NOT PROVIDED'}
                                    </p>
                                </div>
                                <div>
                                    <p className={labelClass}>Religion</p>
                                    <p className="text-sm font-bold text-[var(--patients-muted)] uppercase">{patient.information?.religion || 'None specified'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col p-6">
                            <h4 className={`${labelClass} mb-4 flex items-center gap-2`}>
                                <div className="h-2 w-2 bg-[var(--patients-accent)]" /> Full Address
                            </h4>
                            {patient.information?.address ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase">{patient.information.address.street}</p>
                                    <div className="space-y-0.5 text-[10px] font-bold text-[var(--patients-muted)] uppercase">
                                        <p className="flex justify-between"><span>Brgy:</span> <span>{patient.information.address.barangay}</span></p>
                                        <p className="flex justify-between"><span>City:</span> <span>{patient.information.address.municipality}</span></p>
                                        <p className="flex justify-between"><span>Prov:</span> <span>{patient.information.address.province}</span></p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[10px] text-[var(--patients-muted)] uppercase italic">No address on file</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 bg-blue-600 py-3 text-[10px] font-black tracking-widest text-white uppercase hover:bg-blue-700"
                    >
                        {isInfoOpen ? 'Hide Patient Information' : 'View Patient Information'}
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
                        if (!categories.includes(v)) setCategories([...categories, v]);
                    }}
                    handleCreateBlankPdf={handleCreateBlankPdf}
                    handleToggleMenu={(e, id) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === id ? null : id);
                    }}
                    handleDeleteRecord={(id, name) =>
                        confirm(`Delete ${name}?`) && router.delete(`/records/${id}`)
                    }
                    setSelectedRecord={setSelectedRecord}
                />
            </main>

            {/* --- MODALS --- */}

            {/* HRN MODAL */}
            {isHRNModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-[var(--patients-section-bg)] p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-black tracking-widest text-[var(--patients-accent)] uppercase">HRN Records</h2>
                            <button onClick={() => setIsHRNModalOpen(false)} className="cursor-pointer text-xs font-bold text-red-500 hover:underline">Close</button>
                        </div>
                        <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                            <label className={`${labelClass} mb-1 block opacity-60`}>Existing HRNs</label>
                            {patient.hrns && patient.hrns.length > 0 ? (
                                patient.hrns.map((h) => (
                                    <div key={h.id} className={`flex items-center justify-between rounded border px-3 py-2 font-mono text-xs ${h.hrn === patient.hrn ? 'border-[var(--patients-accent)] bg-[var(--patients-accent)]/10' : 'border-[var(--patients-border)]'}`}>
                                        <span className={h.hrn === patient.hrn ? 'font-black text-[var(--patients-accent)]' : ''}>{h.hrn}</span>
                                        {h.hrn === patient.hrn && <span className="text-[8px] font-black text-[var(--patients-accent)] uppercase">Main</span>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] uppercase italic opacity-50">No additional HRNs recorded.</p>
                            )}
                        </div>
                        {(isAdmin || isStaff) && (
                            <>
                                <div className="my-6 border-t border-dashed border-[var(--patients-border)]" />
                                <h2 className="mb-4 text-[10px] font-black tracking-widest text-[var(--patients-accent)] uppercase">Register New HRN</h2>
                                <form onSubmit={submitHRN} className="space-y-4">
                                    <div>
                                        <label className={labelClass}>HRN Number</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={data.hrns}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 15) setData('hrns', val);
                                            }}
                                            className="mt-1 w-full rounded border border-[var(--patients-border)] bg-transparent px-3 py-2 font-mono text-sm focus:border-[var(--patients-accent)] focus:outline-none"
                                            placeholder="Enter 15-digit HRN..."
                                            required
                                        />
                                        <div className="mt-1 flex justify-between">
                                            {errors.hrns && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.hrns}</p>}
                                            <span className={`text-[9px] uppercase ${data.hrns.length === 15 ? 'text-green-500' : 'text-gray-400'}`}>{data.hrns.length} / 15</span>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={processing} className="w-full cursor-pointer bg-[var(--patients-accent)] px-4 py-2.5 text-[10px] font-black text-white uppercase transition-all hover:brightness-90 disabled:opacity-50">
                                        {processing ? 'Processing...' : 'Add HRN Record'}
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
                        <h2 className="text-sm font-black uppercase">{selectedRecord.file_name}</h2>
                        <div className="flex gap-4">
                            {(isStaff || isAdmin) && (
                                <button
                                    onClick={() => handleAddImage(selectedRecord.id)}
                                    className="flex items-center gap-2 rounded bg-white/10 px-4 py-2 text-[10px] font-black uppercase hover:bg-[var(--patients-accent)]"
                                >
                                    <ImagePlus size={14} /> {isLoading ? 'Appending...' : 'Append Image'}
                                </button>
                            )}
                            <button onClick={() => setSelectedRecord(null)} className="bg-red-600 px-4 py-2 text-[10px] font-black uppercase">Close</button>
                        </div>
                    </div>
                    <div className="flex-1">
                        <iframe
                            key={pdfVersion}
                            src={`${selectedRecord.pdf_url}?v=${pdfVersion}#toolbar=1`}
                            className="h-full w-full border-none"
                        />
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