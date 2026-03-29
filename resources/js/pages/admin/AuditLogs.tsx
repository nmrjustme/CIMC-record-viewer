import { useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ShieldCheck, Search } from 'lucide-react';
import Pagination from '@/components/pagination';

interface Props {
    logs: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string };
}

export default function AuditLogs({ logs, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });
    
    useEffect(() => {
        const interval = setInterval(() => {
            // only: ['logs'] ensures we don't re-fetch shared layout data
            router.reload({ 
                only: ['logs'], 
                preserveScroll: true,
                preserveState: true 
            } as any);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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
                            Track all staff and admin interactions with patient data.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex items-center gap-3">
                        <div className="group relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-4 pl-10 text-sm transition-all placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
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

                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest">User</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Action</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest">IP Address</th>
                                <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{log.user?.name || 'System'}</div>
                                            <div className="text-xs text-zinc-500">{log.user?.role}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${
                                                log.action === 'CREATE' ? 'text-emerald-600' : 
                                                log.action === 'VIEW' ? 'text-blue-700' : 'text-zinc-400'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-600 dark:text-zinc-400">{log.description}</td>
                                        <td className="p-4 text-zinc-500 italic">{log.ip_address}</td>
                                        <td className="p-4 text-right text-zinc-500 italic">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-xs font-black tracking-widest text-zinc-400 uppercase">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                        <Pagination data={logs} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}