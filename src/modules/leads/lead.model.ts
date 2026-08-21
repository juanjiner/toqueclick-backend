export interface LeadDB {
    id: string;
    page_id: string;
    form_data: any;
    created_at: Date;
}

export interface CreateLeadDTO {
    pageId: string;
    formData: any;
}
