export default function Header() {
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
                  <span className="rounded bg-slate-100 px-3 py-1 font-montserrat text-xs font-medium text-slate-500">
                  SECURE ACCESS ONLY
                  </span>
            </header>
    );
}
