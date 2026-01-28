'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Building2, Briefcase, Calendar, ChevronDown, ChevronUp, Eye, EyeOff, Loader2, MapPin, User, X } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { RegisterPayload } from '@/@types/v2/auth';
import { useApiContext } from '@/context/ApiContext';
import { maskCpfCnpj, maskDate, maskPhone } from '@/lib/masks';
import { useCookies } from 'next-client-cookies';

interface RegisterFormData {
    name: string;
    doc: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    birthDate: string;
    profession: string;
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
}

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: RegisterFormData;
    setFormData: React.Dispatch<React.SetStateAction<RegisterFormData>>;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, formData, setFormData }) => {
    const { PostAPI, setToken } = useApiContext();
    const router = useRouter();
    const cookies = useCookies();
    const [loading, setLoading] = useState(false);
    const [fiscalOpen, setFiscalOpen] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    // Valid DDDs in Brazil
    const validDDDs = [
        11, 12, 13, 14, 15, 16, 17, 18, 19,
        21, 22, 24, 27, 28,
        31, 32, 33, 34, 35, 37, 38,
        41, 42, 43, 44, 45, 46, 47, 48, 49,
        51, 53, 54, 55,
        61, 62, 63, 64, 65, 66, 67, 68, 69,
        71, 73, 74, 75, 77, 79,
        81, 82, 83, 84, 85, 86, 87, 88, 89,
        91, 92, 93, 94, 95, 96, 97, 98, 99
    ];

    // --- MASKS & UTILS ---
    const maskCEP = (v: string): string => v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d{3})/, "$1-$2");

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            setCepLoading(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        street: data.logradouro || '',
                        neighborhood: data.bairro || '',
                        city: data.localidade || '',
                        state: data.uf || ''
                    }));
                    toast.success("Endereço encontrado!");
                    if (!fiscalOpen) setFiscalOpen(true);
                } else {
                    toast.error("CEP não encontrado.");
                }
            } catch (err) {
                toast.error("Erro ao buscar CEP.");
            } finally {
                setCepLoading(false);
            }
        }
    };

    const handleChange = (field: keyof RegisterFormData, value: string) => {
        let finalValue = value;
        if (field === 'phone') finalValue = maskPhone(value);
        if (field === 'doc') finalValue = maskCpfCnpj(value);
        if (field === 'birthDate') finalValue = maskDate(value);
        if (field === 'cep') finalValue = maskCEP(value);

        setFormData(prev => ({ ...prev, [field]: finalValue }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Name validation
        if (!formData.name?.trim()) newErrors.name = "Nome é obrigatório";

        // Doc validation (basic length check)
        const docClean = formData.doc?.replace(/\D/g, '');
        if (!docClean || (docClean.length !== 11 && docClean.length !== 14)) {
            newErrors.doc = "CPF ou CNPJ inválido";
        }

        // Phone validation
        const phoneClean = formData.phone?.replace(/\D/g, '');
        if (!phoneClean) {
            newErrors.phone = "Celular é obrigatório";
        } else {
            if (phoneClean.length < 10 || phoneClean.length > 11) {
                newErrors.phone = "Telefone deve ter 10 ou 11 dígitos";
            } else {
                const ddd = parseInt(phoneClean.substring(0, 2));
                if (!validDDDs.includes(ddd)) {
                    newErrors.phone = "DDD inválido";
                }
            }
        }

        // Email validation
        if (!formData.email?.trim()) {
            newErrors.email = "E-mail é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Formato de e-mail inválido";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Senha é obrigatória";
        } else if (formData.password.length < 6) {
            newErrors.password = "Senha deve ter no mínimo 6 caracteres";
        }

        // Confirm Password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem";
        }

        // Birth Date validation
        if (!formData.birthDate?.trim()) {
            newErrors.birthDate = "Data de nascimento é obrigatória";
        } else {
            const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (!dateRegex.test(formData.birthDate)) {
                newErrors.birthDate = "Data inválida (use DD/MM/AAAA)";
            }
        }

        // Profession validation
        if (!formData.profession?.trim()) {
            newErrors.profession = "Profissão é obrigatória";
        } else if (formData.profession.trim().length < 3) {
            newErrors.profession = "Profissão deve ter no mínimo 3 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Verifique os erros no formulário");
            return;
        }

        setLoading(true);
        try {
            // Convert birthDate from DD/MM/YYYY to Date
            const birthDate = moment(formData.birthDate, "DD/MM/YYYY").toDate();

            // Prepare payload matching the API expectations
            const payload: RegisterPayload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.replace(/\D/g, ""), // Remove formatting
                cpfCnpj: formData.doc.replace(/\D/g, ""), // Remove formatting
                birthDate: birthDate,
                profession: formData.profession.trim(),
                password: formData.password,
                // Optional fields - only send if filled
                postalCode: formData.cep ? formData.cep.replace(/\D/g, "") : undefined,
                addressNumber: formData.number || undefined,
            };

            const response = await PostAPI("/user/signup", payload, false);

            if (response.status === 200 || response.status === 201) {
                // Get access token from response
                const token = response.body.accessToken;
                const cookieName =
                    process.env.NEXT_PUBLIC_USER_TOKEN || "legisai-token";

                // Save token in cookie and context
                cookies.set(cookieName, token);
                setToken(token);

                toast.success("Conta criada com sucesso! Você já está logado.");
                onClose();
                
                // Reset form data
                setFormData({
                    name: "",
                    doc: "",
                    phone: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    birthDate: "",
                    profession: "",
                    cep: "",
                    street: "",
                    number: "",
                    neighborhood: "",
                    city: "",
                    state: "",
                });

                // Redirect to home page (user is already logged in)
                // Use full page navigation to ensure the cookie is sent to middleware
                window.location.href = "/";
            } else {
                toast.error(response.body.message || "Falha ao criar conta");
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center p-1">
                                    <img src="/logos/small-logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Criar Nova Conta</h3>
                                    <p className="text-xs text-slate-500">Preencha seus dados para começar</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-2 rounded-full border border-slate-200 hover:bg-slate-50">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Basic Info Group */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                                    <User className="w-4 h-4 mr-2 text-legis-light" /> Dados Pessoais
                                </h4>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                                        <input
                                            type="text" autoComplete="name"
                                            value={formData.name || ''}
                                            onChange={e => {
                                                handleChange('name', e.target.value);
                                                if (errors.name) setErrors({ ...errors, name: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                            placeholder="Ex: João da Silva"
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">CPF ou CNPJ *</label>
                                        <input
                                            type="text"
                                            value={formData.doc || ''}
                                            onChange={e => {
                                                handleChange('doc', e.target.value);
                                                if (errors.doc) setErrors({ ...errors, doc: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.doc ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                            placeholder="000.000.000-00"
                                        />
                                        {errors.doc && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.doc}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Celular / WhatsApp *</label>
                                        <input
                                            type="tel" autoComplete="tel"
                                            value={formData.phone || ''}
                                            onChange={e => {
                                                handleChange('phone', e.target.value);
                                                if (errors.phone) setErrors({ ...errors, phone: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                            placeholder="(00) 00000-0000"
                                        />
                                        {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento *</label>
                                        <input
                                            type="text" autoComplete="bday"
                                            value={formData.birthDate || ''}
                                            onChange={e => {
                                                handleChange('birthDate', e.target.value);
                                                if (errors.birthDate) setErrors({ ...errors, birthDate: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.birthDate ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                            placeholder="DD/MM/AAAA"
                                            maxLength={10}
                                        />
                                        {errors.birthDate && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.birthDate}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Profissional *</label>
                                        <input
                                            type="email" autoComplete="email"
                                            value={formData.email || ''}
                                            onChange={e => {
                                                handleChange('email', e.target.value);
                                                if (errors.email) setErrors({ ...errors, email: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                            placeholder="seu.nome@advocacia.com"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.email}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Profissão *</label>
                                        <input
                                            type="text" autoComplete="organization-title"
                                            value={formData.profession || ''}
                                            onChange={e => {
                                                handleChange('profession', e.target.value);
                                                if (errors.profession) setErrors({ ...errors, profession: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.profession ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                            placeholder="Ex: Advogado"
                                        />
                                        {errors.profession && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.profession}</p>}
                                    </div>

                                    {/* Password Fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password || ''}
                                                onChange={e => {
                                                    handleChange('password', e.target.value);
                                                    if (errors.password) setErrors({ ...errors, password: null });
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha *</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword || ''}
                                                onChange={e => {
                                                    handleChange('confirmPassword', e.target.value);
                                                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-legis-light focus:ring-2 focus:ring-legis-light/20 outline-none transition-all`}
                                                placeholder="Repita a senha"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Fiscal Data Accordion */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setFiscalOpen(!fiscalOpen)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center text-slate-700 font-semibold">
                                        <Building2 className="w-5 h-5 mr-3 text-legis-dark" />
                                        Dados Fiscais / Nota Fiscal
                                        <span className="ml-2 text-xs font-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">Opcional</span>
                                    </div>
                                    {fiscalOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                                </button>

                                <AnimatePresence>
                                    {fiscalOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="p-4 bg-white space-y-4 border-t border-slate-200">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="col-span-1">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">CEP (Busca Automática)</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text" autoComplete="postal-code"
                                                                value={formData.cep || ''}
                                                                onChange={e => handleChange('cep', e.target.value)}
                                                                onBlur={handleCepBlur}
                                                                className="w-full pl-8 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-legis-dark outline-none"
                                                                placeholder="00000-000"
                                                            />
                                                            <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                                                            {cepLoading && <Loader2 className="absolute right-2.5 top-2.5 w-4 h-4 animate-spin text-legis-light" />}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Endereço (Rua)</label>
                                                        <input
                                                            type="text" autoComplete="street-address"
                                                            value={formData.street || ''}
                                                            onChange={e => handleChange('street', e.target.value)}
                                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-legis-dark outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div className="col-span-1">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Número</label>
                                                        <input
                                                            type="text"
                                                            value={formData.number || ''}
                                                            onChange={e => handleChange('number', e.target.value)}
                                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-legis-dark"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Bairro</label>
                                                        <input
                                                            type="text"
                                                            value={formData.neighborhood || ''}
                                                            onChange={e => handleChange('neighborhood', e.target.value)}
                                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-legis-dark"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">UF</label>
                                                        <input
                                                            type="text" maxLength={2}
                                                            value={formData.state || ''}
                                                            onChange={e => handleChange('state', e.target.value.toUpperCase())}
                                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-legis-dark uppercase"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Cidade</label>
                                                    <input
                                                        type="text"
                                                        value={formData.city || ''}
                                                        onChange={e => handleChange('city', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-legis-dark"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-legis-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-legis-dark/90 active:scale-[0.98] transition-all flex items-center justify-center text-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Concluir Cadastro"}
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    Ao clicar em Concluir, você aceita nossos <a href="#" className="underline hover:text-legis-dark">Termos de Uso</a>.
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RegisterModal;
