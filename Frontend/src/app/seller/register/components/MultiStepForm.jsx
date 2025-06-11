'use client';

import { useState, useEffect } from 'react';
import api from '../../../../../lib/api';  
import { useRouter } from 'next/navigation';
import InputField from './InputField'; 
import Button from './Button'; 

export default function MultiStepForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        shop_name: '',
        description: '',
        shop_address: '',
        shop_phone: '',
        logo_url: '',
        cover_image_url: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/seller/register');
            } catch (err) {
                router.push('/login'); // fix sau
            }
        };
        checkAuth();
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = () => {
        let isValid = true;
        const currentStepFields = {
            1: ['shop_name', 'shop_address'],
            2: ['shop_phone'],
            3: ['logo_url', 'cover_image_url'],
        }[currentStep];

        currentStepFields.forEach((field) => {
            if (!formData[field] && field !== 'description' && field !== 'logo_url' && field !== 'cover_image_url') {
                isValid = false;
                document.getElementById(field)?.classList.add('border-red-500');
            } else {
                document.getElementById(field)?.classList.remove('border-red-500');
            }
        });

        return isValid;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateStep()) {
            try {
                const response = await api.post('/seller/register', formData);
                setSuccess(response.data.message);
                setTimeout(() => router.push('/seller/dashboard'), 2000);
            } catch (err) {
                setError(err.response?.data?.message || 'Đăng ký thất bại');
            }
        }
    };

    const showStep = (step) => {
        return (
            <div className="flex justify-between mb-2">
                <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 ${step >= 1 ? '' : 'opacity-50'}`}
                >
                    Shop Info
                </span>
                <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 ${step >= 2 ? '' : 'opacity-50'}`}
                >
                    Contact Details
                </span>
                <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 ${step >= 3 ? '' : 'opacity-50'}`}
                >
                    Images
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Shop Setup Wizard</h1>

            {/* Progress Bar */}
            <div className="mb-8">
                {showStep(currentStep)}
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Form Steps */}
            <form id="multi-step-form" onSubmit={handleSubmit}>
                {/* Step 1: Shop Info */}
                {currentStep === 1 && (
                    <div className="step">
                        <InputField
                            label="Shop Name"
                            name="shop_name"
                            value={formData.shop_name}
                            onChange={handleChange}
                            placeholder="Enter shop name"
                            required
                        />
                        <InputField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter shop description"
                        />
                        <InputField
                            label="Shop Address"
                            name="shop_address"
                            value={formData.shop_address}
                            onChange={handleChange}
                            placeholder="Enter shop address"
                            required
                        />
                    </div>
                )}

                {/* Step 2: Contact Details */}
                {currentStep === 2 && (
                    <div className="step">
                        <InputField
                            label="Shop Phone Number"
                            name="shop_phone"
                            value={formData.shop_phone}
                            onChange={handleChange}
                            placeholder="Enter shop phone number"
                            required
                        />
                    </div>
                )}

                {/* Step 3: Images */}
                {currentStep === 3 && (
                    <div className="step">
                        <InputField
                            label="Logo URL"
                            name="logo_url"
                            type="url"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="Enter logo URL (optional)"
                        />
                        <InputField
                            label="Cover Image URL"
                            name="cover_image_url"
                            type="url"
                            value={formData.cover_image_url}
                            onChange={handleChange}
                            placeholder="Enter cover image URL (optional)"
                        />
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <Button
                        className={currentStep === 1 ? 'hidden' : ''}
                        onClick={handlePrev}
                    >
                        Previous
                    </Button>
                    {currentStep < 3 ? (
                        <Button onClick={handleNext}>Next</Button>
                    ) : (
                        <Button type="submit">Submit</Button>
                    )}
                </div>

                {success && <div className="bg-green-100 text-green-700 p-4 mt-4 rounded">{success}</div>}
                {error && <div className="bg-red-100 text-red-700 p-4 mt-4 rounded">{error}</div>}
            </form>
        </div>
    );
}