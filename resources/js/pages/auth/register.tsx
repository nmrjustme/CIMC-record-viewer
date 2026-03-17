import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Eye, EyeOff } from 'lucide-react';
import { useRegisterForm } from '@/forms/registerForm';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Register',
        href: '/register',
    },
];

export default function Register() {
    const form = useRegisterForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState<
        'success' | 'error'
    >('success');
    const [notificationMessage, setNotificationMessage] = useState('');

    // Password match check
    const passwordsMatch =
        form.data.password === form.data.password_confirmation;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordsMatch) return;

        form.post('/register', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('password', 'password_confirmation');

                // Show success notification
                setNotificationType('success');
                setNotificationMessage('User successfully created!');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
            onError: () => {
                window.scrollTo(0, 0);

                // Optional: show error notification
                setNotificationType('error');
                setNotificationMessage('Failed to create user.');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register" />

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

            <section className="m-8 mx-auto w-full max-w-xl rounded-xl border border-slate-300 bg-white p-8 shadow-md dark:bg-slate-900">
                {/* Header */}
                <div className="mb-6 border-b border-slate-200 pb-4">
                    <h2 className="font-montserrat text-sm font-semibold text-slate-600 uppercase dark:text-slate-400">
                        Create New Account
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="name"
                            className="text-slate-600 dark:text-slate-400"
                        >
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            placeholder="John Doe"
                            value={form.data.name || ''}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="email"
                            className="text-slate-600 dark:text-slate-400"
                        >
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="email@example.com"
                            value={form.data.email || ''}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="role"
                            className="text-slate-600 dark:text-slate-400"
                        >
                            Role
                        </Label>
                        <select
                            id="role"
                            required
                            value={form.data.role || ''}
                            onChange={(e) =>
                                form.setData('role', e.target.value)
                            }
                            className="rounded border border-slate-400 bg-slate-50 px-3 py-2 text-black focus:ring-2 focus:ring-blue-100 focus:outline-none dark:bg-slate-800 dark:text-white"
                        >
                            <option value="" disabled>
                                Select a role
                            </option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        <InputError message={form.errors.role} />
                    </div>

                    {/* Password */}
                    <div className="relative flex flex-col gap-1">
                        <Label
                            htmlFor="password"
                            className="text-slate-600 dark:text-slate-400"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Enter password"
                                value={form.data.password || ''}
                                onChange={(e) =>
                                    form.setData('password', e.target.value)
                                }
                                className="pr-10"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-slate-500 dark:text-slate-400"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </span>
                        </div>
                        <InputError message={form.errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative flex flex-col gap-1">
                        <Label
                            htmlFor="password_confirmation"
                            className="text-slate-600 dark:text-slate-400"
                        >
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                placeholder="Confirm password"
                                value={form.data.password_confirmation || ''}
                                onChange={(e) =>
                                    form.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                className="pr-10"
                            />
                            <span
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-slate-500 dark:text-slate-400"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </span>
                        </div>
                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>

                    {/* Password Mismatch */}
                    {!passwordsMatch && form.data.password_confirmation && (
                        <p className="text-sm text-red-500">
                            Passwords do not match
                        </p>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={form.processing || !passwordsMatch}
                        className={`w-full px-6 py-3 font-montserrat text-sm font-semibold transition-all ${
                            form.processing || !passwordsMatch
                                ? 'cursor-not-allowed opacity-60'
                                : 'bg-blue-800 text-white hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                        {form.processing && <Spinner className="mr-2" />}
                        Create Account
                    </Button>
                </form>
            </section>
        </AppLayout>
    );
}
