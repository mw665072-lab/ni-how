"use client"

import React, { useEffect, useState } from "react"
import { useAuthProtection, useAuth } from "@/hooks/useAuthProtection"
import { useDirection } from '@/hooks/useDirection'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, User } from "lucide-react"

export default function AccountPage() {
    useAuthProtection()
    const { user } = useAuth()
    const dir = useDirection('rtl')

    // Get username and email from localStorage or user object
    const [userName, setUserName] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')

    useEffect(() => {
        const storedName = localStorage.getItem('userName')
        setUserName(storedName || user?.username || 'جون دو')

        // Get email from authUser stored in localStorage or from context
        const authUserStr = localStorage.getItem('authUser')
        if (authUserStr) {
            try {
                const authUser = JSON.parse(authUserStr)
                setUserEmail(authUser?.email || '')
            } catch {
                setUserEmail(user?.email || '')
            }
        } else {
            setUserEmail(user?.email || '')
        }
    }, [user])

    const initials = (userName || user?.email || "User")
        .split(" ")
        .map(s => s[0]?.toUpperCase())
        .slice(0, 2)
        .join("")

    return (
        <div className="min-h-screen bg-white" dir={dir}>
            <div className="w-full max-w-4xl px-3 sm:px-6 py-4 sm:py-6">
                {/* Page Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-right">
                    حسابي
                </h1>

                {/* Profile Card */}
                <Card className="border-2 border-slate-200 rounded-2xl shadow-sm mb-6">
                    <CardContent className="p-6 sm:p-8">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-8">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mb-4 bg-gradient-to-br from-green-400 to-green-600 border-4 border-green-200">
                                <AvatarFallback className="text-4xl sm:text-5xl font-bold text-white bg-transparent">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 text-center">
                                {userName}
                            </h2>
                            <p className="text-sm text-gray-500 text-center">طالب</p>
                        </div>

                        {/* User Information */}
                        <div className="space-y-4">
                            {/* Username Field */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-xs text-gray-500 mb-1">اسم المستخدم</p>
                                    <p className="text-base font-semibold text-gray-800">{userName}</p>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 text-right min-w-0">
                                    <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                                    <p className="text-sm sm:text-base font-semibold text-gray-800 truncate" title={userEmail || user?.email || ''}>
                                        {userEmail || user?.email || 'لم يتم تحديد البريد الإلكتروني'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}