import BukuBesarOptions from "./BukuBesarOptions";

const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    return {
        startDate: fmt(start),
        endDate: fmt(end)
    };
};

const { startDate, endDate } = getCurrentPeriod();

export const ReportOptionsRegistry: Record<string, React.ComponentType<any>> = {
    'buku-besar': BukuBesarOptions,
};

export const ReportDefaultFilters: Record<string, any> = {
    'buku-besar': {
        dateRangeType: 'Periode Sekarang',
        startDate,
        endDate,
        accountSelectionType: 'Semua Akun',
        startAccountCode: '1',
        endAccountCode: '999999999999'
    },
    'laba-rugi-jw': {
        dateRangeType: 'Periode Sekarang',
        startDate,
        endDate,
    },
    'neraca-ht': {
        date: endDate,
    },
    'mutasi-bank': {
        dateRangeType: 'Periode Sekarang',
        startDate,
        endDate,
        bankAccountId: ''
    }
};