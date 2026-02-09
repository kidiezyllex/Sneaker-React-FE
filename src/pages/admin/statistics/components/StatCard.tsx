import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@mdi/react";
import { mdiTrendingUp } from "@mdi/js";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    iconColor: string;
    bgColor: string;
    change?: number;
}

const StatCard = ({
    title,
    value,
    icon,
    iconColor,
    bgColor,
    change,
}: StatCardProps) => {
    const getShadowColor = (bg: string) => {
        if (bg.includes("green")) return "shadow-[0_2px_8px_rgba(34,197,94,0.1)]";
        if (bg.includes("blue")) return "shadow-[0_2px_8px_rgba(59,130,246,0.1)]";
        if (bg.includes("purple")) return "shadow-[0_2px_8px_rgba(168,85,247,0.1)]";
        if (bg.includes("amber")) return "shadow-[0_2px_8px_rgba(245,158,11,0.1)]";
        return "shadow-sm";
    };

    const getBorderColor = (bg: string) => {
        if (bg.includes("green")) return "border-green-200";
        if (bg.includes("blue")) return "border-blue-200";
        if (bg.includes("purple")) return "border-purple-200";
        if (bg.includes("amber")) return "border-amber-200";
        return "border-gray-100";
    };

    return (
        <Card className={`h-full border ${getBorderColor(bgColor)} ${bgColor} ${getShadowColor(bgColor)} transition-all duration-300 hover:-translate-y-1`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium opacity-80 text-maintext">{title}</p>
                        <h3 className="text-2xl font-bold mt-1 text-maintext">
                            {value}
                        </h3>
                        {typeof change === "number" && change !== 0 && (
                            <div className="flex items-center mt-2 bg-white/50 w-fit px-2 py-0.5 rounded-full">
                                <Icon
                                    path={mdiTrendingUp}
                                    size={0.6}
                                    className={change >= 0 ? "text-green-600" : "text-red-600"}
                                />
                                <span
                                    className={`text-xs ml-1 font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {Math.abs(change).toFixed(1)}% {change >= 0 ? "tăng" : "giảm"}
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className="bg-white/60 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm backdrop-blur-sm"
                    >
                        <Icon path={icon} size={1} className={iconColor} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatCard;
