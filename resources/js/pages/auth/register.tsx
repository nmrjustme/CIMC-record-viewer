import { Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { useRegisterForm, RegisterFormData } from '@/forms/registerForm';

type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>;

export default function Register() {
    const form = useRegisterForm();

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/register', {
                        onSuccess: () =>
                            form.reset('password', 'password_confirmation'),
                    });
                }}
                className="flex flex-col gap-6"
            >
                <div className="grid gap-6">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            placeholder="Full name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                        <InputError
                            message={form.errors.name}
                            className="mt-2"
                        />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="email@example.com"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    {/* Role */}
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            required
                            value={form.data.role}
                            onChange={(e) =>
                                form.setData('role', e.target.value)
                            }
                            className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="" disabled>
                                Select a role
                            </option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        <InputError
                            message={form.errors.role}
                            className="mt-2"
                        />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            placeholder="Password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            placeholder="Confirm password"
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                        />
                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        disabled={form.processing}
                    >
                        {form.processing && <Spinner className="mr-2" />}
                        Create account
                    </Button>
                </div>

                {/* Login Link */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()}>Log in</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
