'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuth } from '@/store';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VerifyPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('Verifying authentication...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const companyCode = params.companycode as string;
        const token = searchParams.get('token');

        if (!companyCode || !token) {
            setError('Missing required authentication parameters.');
            return;
        }

        const verify = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/auth/${companyCode}/verify`, {
                    params: { token }
                });

                const { token: jwtToken, user: userName, company } = response.data;
                
                // Store in Redux
                dispatch(setAuth({ user: userName, company, token: jwtToken }));
                
                // Store in LocalStorage for persistence (could use cookie for security)
                localStorage.setItem('auth_token', jwtToken);
                localStorage.setItem('auth_user', userName);
                localStorage.setItem('auth_company', company);

                setStatus('Success! Redirecting...');
                router.push('/');
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 401) {
                    router.push('/expired');
                } else {
                    setError('Authentication failed. Please check your credentials or try again later.');
                }
            }
        };

            verify();
    }, [params, searchParams, router, dispatch]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-4 text-blue-600">Verification</h1>
                {!error ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">{status}</p>
                    </div>
                ) : (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            Retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
