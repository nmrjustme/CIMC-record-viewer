import { useForm } from '@inertiajs/react';

export type RegisterFormData = {
    name: string;
    email: string;
    role: string;
    password: string;
    password_confirmation: string;
};

export const useRegisterForm = () => {
    return useForm<RegisterFormData>({
        name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });
};
