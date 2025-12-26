
export interface Prompt {
    id: string;
    title: string;
    type: string;
    description?: string;
    icon?: string;
    content?: string;
}

export interface Category {
    id: string;
    label: string;
    type: string;
    description: string;
    color: string;
    icon?: any; // Lucide icon or string
}


