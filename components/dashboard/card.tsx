import React from 'react'

const DashboardCard = ({
    title,
    days,
    unit
}: { title: string; days: number; unit: string }) => {
    return (
        <div className="flex flex-col items-center justify-center w-auto h-[144px] gap-3 rotate-0 opacity-100">
            <p className="font-nunito-semibold-16 mb-2">{title}</p>
            <h3 className="font-nunito-extrabold-56 mb-2">{days}</h3>
            <p className="font-nunito-semibold-16 mb-2">{unit}</p>
        </div>

    )
}

export default DashboardCard
