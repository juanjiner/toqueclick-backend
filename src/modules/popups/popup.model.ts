export type PopupPosition = 'CENTER' | 'BOTTOM_RIGHT';
export type PopupIcon = 'INFO' | 'WARNING' | 'GIFT' | 'MEGAPHONE';
export type PopupFrequency = 'always' | 'once_per_session' | 'once_per_user';

export interface PopupDisplayRules {
    targetPages?: string[];
    delaySeconds?: number;
    frequency?: PopupFrequency;
}

export interface Popup {
    id: string;
    title: string;
    description: string | null;
    icon: PopupIcon;
    position: PopupPosition;
    ctaText: string | null;
    ctaLink: string | null;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    displayRules: PopupDisplayRules | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePopupDTO {
    title: string;
    description?: string | null;
    icon: PopupIcon;
    position: PopupPosition;
    ctaText?: string | null;
    ctaLink?: string | null;
    isActive?: boolean;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    displayRules?: PopupDisplayRules | null;
}

export interface UpdatePopupDTO extends Partial<CreatePopupDTO> {}
