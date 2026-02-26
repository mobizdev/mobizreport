import { 
    LayoutDashboard, LineChart, Wallet, Briefcase, Package, ShoppingCart, 
    TrendingUp, UserCheck, Calculator, Landmark, BookOpen, Scale, Palette
} from 'lucide-react';

export const sidebarItems = [
    { id: 'akunting', label: 'Akunting', icon: LineChart },
    { id: 'kas-bank', label: 'Kas Bank', icon: Wallet },
    { id: 'aktiva-tetap', label: 'Aktiva Tetap', icon: Briefcase },
    { id: 'umum', label: 'Umum', icon: LayoutDashboard },
    { id: 'persediaan', label: 'Persediaan', icon: Package },
    { id: 'pembelian', label: 'Pembelian', icon: ShoppingCart },
    { id: 'penjualan', label: 'Penjualan', icon: TrendingUp },
    { id: 'penjual', label: 'Penjual', icon: UserCheck },
    { id: 'designer', label: 'Desain Laporan', icon: Palette },
];

export const reportItems: Record<string, any[]> = {
    'akunting': [
        { id: 'buku-besar', title: 'Buku Besar', icon: BookOpen, formId: 41001, desc: 'Laporan ini berisi jurnal-jurnal dari transaksi yang ada di dalam jangka waktu yang dipilih.' },
        { id: 'laba-rugi-jw', title: 'Laba Rugi - Jangka Waktu', icon: TrendingUp },
        { id: 'laba-rugi-mp', title: 'Laba Rugi - Multi Periode', icon: LineChart },
        { id: 'laba-rugi-mt', title: 'Laba Rugi - Multi Tahun', icon: LineChart },
        { id: 'neraca-ht', title: 'Neraca - Hingga Tanggal', icon: Scale },
        { id: 'neraca-mp', title: 'Neraca - Multi Periode', icon: Scale },
        { id: 'neraca-mt', title: 'Neraca - Multi Tahun', icon: Scale },
    ],
    'kas-bank': [
        { id: 'mutasi-bank', title: 'Mutasi Bank', icon: Landmark },
        { id: 'rekonsiliasi', title: 'Rekonsiliasi Bank', icon: Calculator },
    ]
};