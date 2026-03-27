import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ShieldCheck, Search, Calendar } from 'lucide-react';

interface Props {
    logs: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: { search?: string };
}

export default function AuditLogs({ logs, filters }: Props) {
    // Initialize form with existing filter value
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(`/activity-logs`, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Audit Logs', href: '/admin/logs' }]}>
            <Head title="System Audit Logs" />

            <div className="p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <ShieldCheck className="text-indigo-500" />
                            System Audit Logs
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Track all staff and admin interactions with patient
                            data.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-3"
                    >
                        <div className="group relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="w-full rounded-lg border border-[var(--patients-border)] bg-[var(--patients-section-bg)] py-2 pr-4 pl-10 text-sm transition-all placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500/20 focus:outline-none"
                                value={data.search}
                                onChange={(e) =>
                                    setData('search', e.target.value)
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl border border-[var(--patients-section-border)] bg-[var(--patients-section-bg)]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/5 text-[var(--patients-muted)] dark:bg-black/40">
                            <tr>
                                <th className="p-4 text-xs font-semibold uppercase">
                                    User
                                </th>
                                <th className="p-4 text-xs font-semibold uppercase">
                                    Action
                                </th>
                                <th className="p-4 text-xs font-semibold uppercase">
                                    Description
                                </th>
                                <th className="p-4 text-xs font-semibold uppercase">
                                    IP Address
                                </th>
                                <th className="p-4 text-right text-xs font-semibold uppercase">
                                    Timestamp
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-black/5 dark:hover:bg-white/5"
                                    >
                                        <td className="p-4">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                                {log.user?.name || 'System'}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {log.user?.role}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${
                                                    log.action === 'CREATE'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : log.action ===
                                                            'SEARCH'
                                                          ? 'bg-blue-100 text-blue-700'
                                                          : 'bg-zinc-100 text-zinc-600'
                                                }`}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-600 dark:text-zinc-400">
                                            {log.description}
                                        </td>
                                        <td className="p-4 text-zinc-500 italic">
                                            {log.ip_address}
                                        </td>
                                        <td className="p-4 text-right text-zinc-500 italic">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-8 text-center text-zinc-500"
                                    >
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.links && logs.links.length > 3 && (
                    <div className="mt-6 flex justify-center gap-1">
                        {logs.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || ''}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function route(arg0: string): string {
    throw new Error('Function not implemented.');
}
