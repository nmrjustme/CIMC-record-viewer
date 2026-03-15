export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square h-8 w-8 items-center justify-center">
                <img
                    src="/images/cimc_logo.png"
                    alt="CIMC Logo"
                    className="h-8 w-8 object-cover" // increased from 5 -> 7
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    CIMC Record Finder
                </span>
            </div>
        </>
    );
}
