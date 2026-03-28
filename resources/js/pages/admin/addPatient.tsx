import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Patient } from '@/types/patient';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import PatientTable from '@/pages/PatientTable';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Add Patient', href: '/patients/create' },
];

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-4 py-4 md:px-8">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800"></div>
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
    nationalities: string[];
    auth: { user: { role: string } };
};

export default function AddPatient({ patients, nationalities, auth }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState<
        'success' | 'error'
    >('success');
    const [notificationMessage, setNotificationMessage] = useState('');
    
    const [openHrnDropdown, setOpenHrnDropdown] = useState<number | null>(null);

    const isAdmin = auth.user.role === 'admin';
    const isStaff = auth.user.role === 'staff';
    const canUseDark = isAdmin || isStaff;

    useEffect(() => {
        if (!canUseDark) {
            document.documentElement.classList.remove('dark');
        }
    }, [canUseDark]);

    const initialFormState = {
        hrn: '',
        firstname: '',
        middlename: '',
        lastname: '',
        sex: '',
        civil_status: '',
        nationality: 'Filipino',
        birthdate: '',
        place_of_birth: '',
        phone_number: '',
        religion: '',
        street: '',
        barangay: '',
        municipality: '',
        province: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    const isAddDisabled =
        isLoading ||
        formData.hrn.length !== 15 ||
        !formData.firstname ||
        !formData.lastname ||
        !formData.sex ||
        !formData.civil_status ||
        !formData.nationality ||
        !formData.birthdate ||
        !formData.place_of_birth ||
        !formData.street ||
        !formData.barangay ||
        !formData.municipality ||
        !formData.province;

    const handleClear = () => setFormData(initialFormState);

    const handleAddPatient = () => {
        if (isAddDisabled) return;
        setIsLoading(true);

        router.post('/patients', formData, {
            onSuccess: () => {
                setFormData(initialFormState);
                setNotificationType('success');
                setNotificationMessage('Patient successfully added!');
                setShowNotification(true);
            },
            onError: () => {
                setNotificationType('error');
                setNotificationMessage(
                    'Failed to add patient. Please try again.',
                );
                setShowNotification(true);
            },
            onFinish: () => {
                setIsLoading(false);
                setTimeout(() => setShowNotification(false), 4000);
            },
        });
    };

    const labelClass =
        'mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--patients-muted)]';
    const inputClass =
        'w-full bg-[var(--patients-sidebar-bg)] border border-[var(--patients-border)] px-3 py-2.5 text-sm uppercase outline-none transition-all focus:border-[var(--patients-accent)] disabled:bg-zinc-100 dark:disabled:bg-zinc-900 text-[var(--patients-text)]';

    const pageContent = (
        <div className="relative min-h-screen bg-[var(--patients-sidebar-bg)] text-[var(--patients-text)] transition-colors duration-200">
            <Head title="Add Patient" />

            <div
                className={`fixed top-4 right-4 z-50 transform transition-all duration-500 md:top-24 md:right-8 ${showNotification ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}
            >
                <div className="flex items-center gap-4 rounded border border-[var(--patients-border)] bg-[var(--patients-section-bg)] p-4 shadow-xl">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg dark:text-black ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
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
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        )}
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black tracking-widest text-[var(--patients-muted)] uppercase">
                            {notificationType === 'success'
                                ? 'Success'
                                : 'Error'}
                        </h4>
                        <p className="text-sm font-bold">
                            {notificationMessage}
                        </p>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full p-6">
                <section className="mb-6 rounded-lg border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)] p-4 md:p-8">
                    <div className="mb-6 border-b border-[var(--patients-border)] pb-4">
                        <h2 className="text-xs font-bold tracking-widest text-[var(--patients-muted)] uppercase">
                            Register New Patient
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        <div className="md:col-span-1">
                            <label className={labelClass}>
                                HRN (15 Digits)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="000000000000000"
                                value={formData.hrn}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        hrn: e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 15),
                                    })
                                }
                                className={`${inputClass} font-mono tracking-[0.1em] shadow-[var(--input-shadow)]`}
                            />
                            <div className="mt-1 text-right">
                                <span
                                    className={`text-[10px] font-bold ${formData.hrn.length === 15 ? 'text-green-500' : 'text-[var(--patients-muted)]'}`}
                                >
                                    {formData.hrn.length}/15
                                </span>
                            </div>
                        </div>
                        {['lastname', 'firstname', 'middlename'].map(
                            (field) => (
                                <div key={field}>
                                    <label className={labelClass}>
                                        {field === 'middlename'
                                            ? 'Middle Name'
                                            : field === 'lastname'
                                              ? 'Last Name'
                                              : 'First Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            formData[
                                                field as keyof typeof formData
                                            ]
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [field]: e.target.value.replace(
                                                    /[^a-zA-Z\s.-]/g,
                                                    '',
                                                ),
                                            })
                                        }
                                        className={`${inputClass} shadow-[var(--input-shadow)]`}
                                    />
                                </div>
                            ),
                        )}

                        <div>
                            <label className={labelClass}>Sex</label>
                            <select
                                value={formData.sex}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sex: e.target.value,
                                    })
                                }
                                className={`${inputClass} shadow-[var(--input-shadow)]`}
                            >
                                <option value="">Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Birthdate</label>
                            <input
                                type="date"
                                value={formData.birthdate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        birthdate: e.target.value,
                                    })
                                }
                                className={`${inputClass} shadow-[var(--input-shadow)]`}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Civil Status</label>
                            <select
                                value={formData.civil_status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        civil_status: e.target.value,
                                    })
                                }
                                className={`${inputClass} shadow-[var(--input-shadow)]`}
                            >
                                <option value="">Select Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Separated">Separated</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Civil Partner">
                                    Civil Partner/Union
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Nationality</label>
                            <input
                                type="text"
                                list="nats"
                                value={formData.nationality}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        nationality: e.target.value,
                                    })
                                }
                                className={`${inputClass} shadow-[var(--input-shadow)]`}
                            />
                            <datalist id="nats">
                                {nationalities.map((n) => (
                                    <option key={n} value={n} />
                                ))}
                            </datalist>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Place of Birth</label>
                            <input
                                type="text"
                                value={formData.place_of_birth}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        place_of_birth: e.target.value,
                                    })
                                }
                                className={`${inputClass} shadow-[var(--input-shadow)]`}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                placeholder="+63"
                                value={formData.phone_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone_number: e.target.value.replace(
                                            /[^0-9+\- ]/g,
                                            '',
                                        ),
                                    })
                                }
                                className={`${inputClass} shadow-[var(--input-shadow)]`}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>
                                Religion (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.religion}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        religion: e.target.value.replace(
                                            /[^a-zA-Z\s.-]/g,
                                            '',
                                        ),
                                    })
                                }
                                className={`${inputClass} shadow-[var(--input-shadow)]`}
                            />
                        </div>

                        <div className="border-t border-[var(--patients-border)] pt-6 md:col-span-4">
                            <h3 className="mb-4 text-[10px] font-bold tracking-widest text-[var(--patients-muted)] uppercase">
                                Residential Address
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                {[
                                    'street',
                                    'barangay',
                                    'municipality',
                                    'province',
                                ].map((field) => (
                                    <div key={field}>
                                        <label className={labelClass}>
                                            {field === 'street'
                                                ? 'Street (Purok)'
                                                : field}
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                formData[
                                                    field as keyof typeof formData
                                                ]
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    [field]: e.target.value,
                                                })
                                            }
                                            className={`${inputClass} shadow-[var(--input-shadow)]`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={handleAddPatient}
                            disabled={isAddDisabled}
                            className="w-full cursor-pointer bg-[var(--patients-accent)] px-6 py-3 text-xs font-black tracking-widest text-white uppercase transition-all hover:brightness-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 sm:min-w-[180px]"
                        >
                            {isLoading ? 'Processing...' : 'Add Patient +'}
                        </button>
                        <button
                            onClick={handleClear}
                            className="w-full cursor-pointer border border-[var(--patients-border)] px-6 py-3 text-xs font-bold text-[var(--patients-muted)] uppercase transition-colors hover:text-[var(--patients-text)] sm:w-auto"
                        >
                            Clear Form
                        </button>
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
