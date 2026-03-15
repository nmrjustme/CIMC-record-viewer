import { Link, usePage, router } from '@inertiajs/react';

export default function Header() {
    // Get auth from the Inertia page props
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;

    // Logout handler
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-400 bg-white/80 px-8 py-3 backdrop-blur-md">
            <h2 className="flex items-center gap-2 font-montserrat text-xl font-bold text-slate-800">
                <img
                    src="/images/cimc_logo.png"
                    alt="CIMC"
                    className="h-9 w-auto transition-transform hover:scale-105"
                />
                CIMC Record
            </h2>
            <div className="flex items-center gap-4">
                <span className="rounded bg-slate-100 px-3 py-1 font-montserrat text-xs font-medium text-slate-500">
                    SECURE ACCESS ONLY
                </span>

                {/* Dashboard link for admin */}
                {auth?.user?.role === 'admin' && (
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center rounded bg-blue-600 px-4 py-1 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Dashboard
                    </Link>
                )}

                {/* Logout button for all users */}
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded bg-red-600 px-4 py-1 font-semibold text-white transition hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
