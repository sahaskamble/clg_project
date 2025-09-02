'use client';
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pb } from "../lib/pocketbase";

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in when component mounts
    useEffect(() => {
        if (pb.authStore.isValid) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

        // Subscribe to auth changes
        const removeListener = pb.authStore.onChange(() => {
            setIsLoggedIn(pb.authStore.isValid);
        });

        return () => removeListener();
    }, []);

    // const handleProfileClick = async () => {
    //     try {
    //         const userId = pb.authStore.model?.id;
    //         if(!userId) {
    //             router.push('/Login');
    //             return;
    //         }
    //         try {
    //             const therapistRecord = await pb.collection('therapist_profile').getFirstListItem(`therapist_id="${userId}"`);
    //             router.push(`/therapist_profile/${therapistRecord.id}`);
    //         } catch (error) {
    //             router.push(`/user_profile`);
    //         }
    //     } catch (error) {
    //         router.push('/Login');
    //     }
    // }
    // 
    
    // ...existing code...
const handleProfileClick = async () => {
    const user = pb.authStore.model;
    const userId = user?.id;
    if (!userId) {
        router.push('/Login');
        return;
    }
    if (user.role === 'therapist') {
        try {
            // Try to find therapist profile by userId
            const therapistRecord = await pb.collection('therapist_profile').getFirstListItem(`userId="${userId}"`);
            router.push(`/therapist_profile/${therapistRecord.id}`);
        } catch (error) {
            // If not found, redirect to create profile page
            router.push(`/therapist_profile/${userId}`);
        }
    } else if (user.role === 'user') {
        router.push(`/user_profile/${userId}`);
    } else {
        router.push('/');
    }
};
// ...existing code...

    return (
        <header className="sticky top-0 z-50 w-full bg-white">
            <div className="header shadow-md flex items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="w-[60px] h-[60px] bg-purple-900 rounded-full inline-flex justify-center items-center">
                        <Image src="/logo.png" width={70} height={60} alt="logo" className="object-contain" />
                    </div>
                    <div className="logo-text font-bold flex ml-2">
                        <span className="text-xl text-purple-900 tracking-wide m-0">BLUE</span>
                        <span className="text-xl text-purple-900 tracking-wide m-0">SAGE</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8 text-lg font-semibold text-purple-900">
                    <a href="#" className="hover:text-black transition-colors duration-200">REFERENCES</a>
                    <a href="#" className="hover:text-black transition-colors duration-200">RESOURCES</a>
                    <a href="#" className="hover:text-black transition-colors duration-200">HOME</a>
                    <a href="#" className="hover:text-black transition-colors duration-200">BLOG</a>
                    <button className="hover:text-black transition-colors duration-200">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </nav>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                    {!isLoggedIn ? (
                        <div className="flex space-x-2">
                            <Link href="/therapist_login">
                                <button type="button" className="bg-purple-900 hover:bg-purple-700 text-white py-2 px-4 rounded-md shadow transition-colors duration-200 flex items-center text-sm">
                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                    Therapist LOGIN / SIGNUP
                                </button>
                            </Link>
                            <Link href="/user_login">
                                <button type="button" className="bg-purple-900 hover:bg-purple-700 text-white py-2 px-4 rounded-md shadow transition-colors duration-200 flex items-center text-sm">
                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                    User LOGIN / SIGNUP
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={handleProfileClick}
                                className="bg-purple-900 hover:bg-purple-700 text-white py-2 px-4 rounded-md shadow transition-colors duration-200 flex items-center text-sm"
                            >
                                <FontAwesomeIcon icon={faCircleUser} className="mr-2" />
                                YOUR PROFILE
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    pb.authStore.clear();
                                    router.push('/');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md shadow transition-colors duration-200 flex items-center text-sm"
                            >
                                LOGOUT
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
