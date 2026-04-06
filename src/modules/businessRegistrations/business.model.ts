export interface BusinessRegistration {
    id?: string;

    // Step 1: Business Information
    legalName: string;
    tradeName: string;
    ruc: string;
    categoryId: string;
    departmentId: string;
    provinceId: string;
    districtId: string;

    // Step 2: Contact Information
    contactName: string;
    contactPosition: string;
    phone: string;
    email: string;

    // Step 3: Business Preferences
    benefitPercentageDiscounts: boolean;
    benefit2x1Promotions: boolean;
    benefitFreeProducts: boolean;
    benefitLoyaltyPoints: boolean;
    benefitExclusiveOffers: boolean;
    additionalComments?: string;

    // Step 4: Confirmation
    termsAccepted: boolean;
    status?: string;
}