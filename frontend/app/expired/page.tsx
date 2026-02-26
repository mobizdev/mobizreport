'use client';

export default function ExpiredPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <div className="bg-red-100 text-red-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    !
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Sesi Kedaluwarsa</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Link laporan ini sudah kedaluwarsa untuk alasan keamanan (maksimal 1 hari). 
                    Silakan buka kembali laporan dari aplikasi utama Anda.
                </p>
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                    Mohon hindari melakukan bookmark pada link laporan ini.
                </div>
            </div>
        </div>
    );
}
