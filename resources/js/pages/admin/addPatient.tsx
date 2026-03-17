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

// Helper classes for consistent styling
const labelClass =
    'block mb-1.5 font-montserrat text-[10px] font-semibold tracking-wider text-slate-500 uppercase';
const inputClass =
    'w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 font-montserrat text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 uppercase';

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
    nationalities: string[];
};

export default function AddPatient({ patients, nationalities }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const patientData = patients.data || [];

    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState<
        'success' | 'error'
    >('success');
    const [notificationMessage, setNotificationMessage] = useState('');

    const initialFormState = {
        hrn: '',
        firstname: '',
        middlename: '', // Optional
        lastname: '',
        sex: '',
        civil_status: '',
        nationality: 'Filipino',
        birthdate: '',
        place_of_birth: '',
        phone_number: '', // Optional
        religion: '', // Optional
        street: '',
        barangay: '',
        municipality: '',
        province: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    // Validation logic: All required except Phone Number and Religion
    const isAddDisabled =
        isLoading ||
        !formData.hrn ||
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

                // Auto-hide after 3 seconds
                setTimeout(() => setShowNotification(false), 3000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="relative min-h-screen bg-slate-100 font-sans text-slate-900">
                <Head title="Add Patient" />
                {/* NOTIFICATION ALERT */}
                <div
                    className={`fixed top-24 right-8 z-50 transform transition-all duration-500 ${
                        showNotification
                            ? 'translate-x-0 opacity-100'
                            : 'pointer-events-none translate-x-full opacity-0'
                    }`}
                >
                    <div
                        className={`flex items-center gap-4 rounded-xl border p-5 shadow-2xl ${
                            notificationType === 'success'
                                ? 'border-green-200 bg-white shadow-green-200/40'
                                : 'border-red-200 bg-white shadow-red-200/40'
                        }`}
                    >
                        {/* ICON */}
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ${
                                notificationType === 'success'
                                    ? 'bg-green-600 shadow-green-200'
                                    : 'bg-red-600 shadow-red-200'
                            }`}
                        >
                            {notificationType === 'success' ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            )}
                        </div>

                        {/* TEXT */}
                        <div className="min-w-[160px]">
                            <h4
                                className={`text-[10px] font-black tracking-widest uppercase ${
                                    notificationType === 'success'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {notificationType === 'success'
                                    ? 'Success'
                                    : 'Error'}
                            </h4>
                            <p className="font-montserrat text-sm font-semibold text-slate-700">
                                {notificationMessage}
                            </p>
                        </div>

                        {/* CLOSE BUTTON */}
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
                    {/* ADD PATIENT FORM */}
                    <section className="mb-8 rounded-xl border border-slate-300 bg-white p-8 shadow-sm">
                        <div className="mb-6 border-b border-slate-100 pb-4">
                            <h2 className="font-montserrat text-sm font-bold tracking-tight text-slate-700 uppercase">
                                Add New Patient
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                            {/* HRN & Names */}
                            <div className="md:col-span-1">
                                <label className={labelClass}>HRN</label>
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
                                    className={inputClass}
                                />
                                <div className="mt-1 text-right">
                                    <span
                                        className={`text-[10px] font-bold ${formData.hrn.length === 15 ? 'text-green-600' : 'text-slate-400'}`}
                                    >
                                        {formData.hrn.length} / 15
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastname}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lastname: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstname}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            firstname: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
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
                                    className={inputClass}
                                />
                            </div>

                            {/* Personal Info */}
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
                                    className={inputClass}
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
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Civil Status
                                </label>
                                <select
                                    value={formData.civil_status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            civil_status: e.target.value,
                                        })
                                    }
                                    className={inputClass}
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
                                <label className={labelClass}>
                                    Nationality
                                </label>
                                <input
                                    type="text"
                                    list="nationality-list"
                                    value={formData.nationality}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nationality: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    placeholder="Search..."
                                />
                                <datalist id="nationality-list">
                                    {nationalities.map((nation) => (
                                        <option key={nation} value={nation} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    Place of Birth
                                </label>
                                <input
                                    type="text"
                                    value={formData.place_of_birth}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            place_of_birth: e.target.value,
                                        })
                                    }
                                    className={inputClass}
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
                                            phone_number:
                                                e.target.value.replace(
                                                    /[^0-9+\- ]/g,
                                                    '',
                                                ),
                                        })
                                    }
                                    className={inputClass}
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
                                            religion: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            {/* Address Section */}
                            <div className="mt-2 md:col-span-4">
                                <h3 className="mb-4 border-b border-slate-100 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                    Residential Address
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                    <div>
                                        <label className={labelClass}>
                                            Street (Purok)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.street}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    street: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Barangay
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.barangay}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    barangay: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Municipality
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.municipality}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    municipality:
                                                        e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Province
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.province}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    province: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="mt-8 flex items-center gap-3">
                            <button
                                onClick={handleAddPatient}
                                disabled={isAddDisabled}
                                className={`min-w-[160px] rounded-md px-6 py-3 font-montserrat text-xs font-bold text-white transition-all ${isAddDisabled ? 'cursor-not-allowed bg-green-300 opacity-60' : 'cursor-pinter bg-green-800 shadow-md hover:bg-green-700 active:scale-95'}`}
                            >
                                {isLoading ? 'ADDING...' : 'ADD PATIENT +'}
                            </button>
                            <button
                                onClick={handleClear}
                                className="cursor-pointer rounded-md border border-slate-300 bg-white px-6 py-3 font-montserrat text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                            >
                                CLEAR
                            </button>
                        </div>
                    </section>

                    {/* PATIENT LIST TABLE */}
                    <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-8 py-4">HRN</th>
                                        <th className="px-8 py-4">
                                            Patient Name
                                        </th>
                                        <th className="px-8 py-4 text-center">
                                            Files
                                        </th>
                                        <th className="px-8 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <SkeletonRow />
                                    ) : (
                                        patientData.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="transition-colors hover:bg-blue-50/30"
                                            >
                                                <td className="px-8 py-5 font-mono text-sm font-medium text-blue-600">
                                                    {p.hrn}
                                                </td>
                                                <td className="px-8 py-5 font-montserrat text-sm font-semibold text-slate-800 capitalize">
                                                    {p.lastname}, {p.firstname}{' '}
                                                    {p.middlename}
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                                                        📄{' '}
                                                        {p.records_count ?? 0}{' '}
                                                        PDF(s)
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Link
                                                        href={`/viewer/${p.hrn}/folder`}
                                                        className="rounded bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                                                    >
                                                        VIEW FILE
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* SERVER-SIDE PAGINATION */}
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-8 py-4">
                            <div className="font-montserrat text-[10px] font-bold text-slate-500 uppercase">
                                Page {patients.current_page} of{' '}
                                {patients.last_page} — {patients.total} total
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
                                                  : 'cursor-not-allowed text-slate-300'
                                        }`}
                                        preserveScroll
                                        preserveState
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </AppLayout>
    );
}
