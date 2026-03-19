import { Head, Link, router } from '@inertiajs/react';
import { useState, ChangeEvent, FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Eye, EyeOff } from 'lucide-react';
import { useRegisterForm } from '@/forms/registerForm';
import type { BreadcrumbItem } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    links?: { url: string | null; label: string; active: boolean }[];
}

interface RegisterProps {
    users: PaginatedUsers;
}

interface EditFormData {
    name: string;
    email: string;
    role: string;
    new_password?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Register', href: '/register' },
];

export default function Register({ users }: RegisterProps) {
    const form = useRegisterForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState<
        'success' | 'error'
    >('success');
    const [notificationMessage, setNotificationMessage] = useState('');

    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState<EditFormData>({
        name: '',
        email: '',
        role: 'staff',
    });

    const isLoading = !users || !users.data;
    const passwordsMatch =
        form.data.password === form.data.password_confirmation;

    // CREATE USER
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch) return;

        form.post('/register', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('password', 'password_confirmation');
                setNotificationType('success');
                setNotificationMessage('User successfully created!');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
            onError: () => {
                window.scrollTo(0, 0);
                setNotificationType('error');
                setNotificationMessage('Failed to create user.');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
        });
    };

    // EDIT USER
    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            new_password: '',
        });
        setOpenEditModal(true);
    };

    const handleEditChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        // Remove new_password if empty to avoid sending undefined
        const payload: EditFormData = { ...editFormData };
        if (!payload.new_password) delete payload.new_password;

        router.put(`/users/${selectedUser.id}`, payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setOpenEditModal(false);
                setNotificationType('success');
                setNotificationMessage('User updated successfully!');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
            onError: () => {
                setNotificationType('error');
                setNotificationMessage('Failed to update user.');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
        });
    };

    // DELETE USER
    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setOpenDeleteModal(true);
    };

    const handleDeleteSubmit = () => {
        if (!selectedUser) return;

        router.delete(`/users/${selectedUser.id}`, {
            onSuccess: () => {
                setOpenDeleteModal(false);
                setNotificationType('success');
                setNotificationMessage('User deleted successfully!');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
            onError: () => {
                setNotificationType('error');
                setNotificationMessage('Failed to delete user.');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register" />

            {/* NOTIFICATION */}
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

            {/* CREATE USER FORM */}
            <section className="m-8 mx-auto w-full max-w-xl rounded-xl border border-slate-300 bg-white p-8 shadow-md dark:bg-slate-900">
                <div className="mb-6 border-b border-slate-200 pb-4">
                    <h2 className="font-montserrat text-sm font-semibold text-slate-600 uppercase dark:text-slate-400">
                        Create New Account
                    </h2>
                </div>
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

                    {!passwordsMatch && form.data.password_confirmation && (
                        <p className="text-sm text-red-500">
                            Passwords do not match
                        </p>
                    )}

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

            {/* USER LIST TABLE */}
            <section className="m-10 mt-8 overflow-hidden rounded-lg border border-slate-300 bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <div className="m-6 mb-6 border-b border-slate-200 pb-4">
                        <h2 className="font-montserrat text-sm font-semibold text-slate-600 uppercase dark:text-slate-400">
                            User's Lists
                        </h2>
                    </div>
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-300 bg-black/5 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:bg-black/40">
                            <tr>
                                <th className="px-8 py-4">ID</th>
                                <th className="px-8 py-4">Name</th>
                                <th className="px-8 py-4">Email</th>
                                <th className="px-8 py-4 text-center">Role</th>
                                <th className="px-8 py-4 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-8 py-6 text-center text-sm text-slate-400"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                    >
                                        <td className="px-8 py-5 font-mono text-sm text-blue-600">
                                            {user.id}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold uppercase">
                                            {user.name}
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-300">
                                            {user.email}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="space-x-2 px-8 py-5 text-right">
                                            <button
                                                onClick={() =>
                                                    handleEditClick(user)
                                                }
                                                className="border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase transition hover:bg-blue-600 hover:text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(user)
                                                }
                                                className="border border-red-300 px-3 py-1 text-[10px] font-bold uppercase transition hover:bg-red-600 hover:text-white"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* PAGINATION */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-300 bg-black/5 px-8 py-4 md:flex-row dark:bg-black/40">
                    <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Page {users?.current_page} of {users?.last_page} —{' '}
                        {users?.total} total
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        {users?.links?.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                                preserveState
                                className={`flex h-8 min-w-[32px] items-center justify-center rounded px-3 text-[10px] font-bold transition-all ${link.active ? 'bg-blue-600 text-white shadow-md' : link.url ? 'border border-slate-300 bg-white text-slate-700 hover:border-blue-600' : 'cursor-not-allowed text-slate-400 opacity-50'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* EDIT USER MODAL */}
            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={handleEditSubmit}
                        className="mt-2 space-y-4"
                    >
                        {/* Name */}
                        <div>
                            <Label>Name</Label>
                            <Input
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <Label>Role</Label>
                            <select
                                name="role"
                                value={editFormData.role}
                                onChange={handleEditChange}
                                className="mt-1 w-full rounded border p-2"
                            >
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>

                        {/* New Password */}
                        <div>
                            <Label>New Password (optional)</Label>
                            <Input
                                type="password"
                                name="new_password"
                                value={editFormData.new_password || ''}
                                onChange={handleEditChange}
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <DialogFooter className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpenEditModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE USER MODAL */}
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Are you sure you want to delete{' '}
                        <strong>{selectedUser?.name}</strong>? This action
                        cannot be undone.
                    </div>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpenDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteSubmit}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
