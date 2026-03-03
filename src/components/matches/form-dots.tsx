import { cn } from "@/lib/utils";

interface FormDotsProps {
    form: string; // e.g. "WDLWW"
    className?: string;
}

export function FormDots({ form, className }: FormDotsProps) {
    if (!form || form === "N/A") return null;

    // Map characters to colors/labels
    const getStatusColor = (char: string) => {
        switch (char.toUpperCase()) {
            case 'W': return 'bg-green-500';
            case 'D': return 'bg-yellow-500';
            case 'L': return 'bg-red-500';
            default: return 'bg-gray-300';
        }
    };

    const getStatusLabel = (char: string) => {
        switch (char.toUpperCase()) {
            case 'W': return 'Ganado';
            case 'D': return 'Empatado';
            case 'L': return 'Perdido';
            default: return 'Pendiente';
        }
    };

    // Take only last 5 if longer
    const lastFive = form.slice(-5).split('');

    return (
        <div className={cn("flex space-x-1 mt-1", className)}>
            {lastFive.map((char, i) => (
                <div
                    key={i}
                    title={getStatusLabel(char)}
                    className={cn(
                        "w-2 h-2 rounded-full",
                        getStatusColor(char)
                    )}
                />
            ))}
        </div>
    );
}
