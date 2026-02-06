// User types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    roles: string[];  // ["admin", "treasurer", "member"]
    family_branch?: string;
    city?: string;
    photo_url?: string;
    created_at: Date;
}

// Announcement types
export interface Announcement {
    id: string;
    title: string;
    content: string;
    attachments?: string[];
    created_by: string;
    created_at: Date;
}

// Event types
export interface Event {
    id: string;
    title: string;
    description: string;
    event_date: Date;
    photos?: string[];
    created_by: string;
    created_at: Date;
}

// Contribution types
export interface Contribution {
    id: string;
    user_id: string;
    year: number;
    amount: number;
    status: 'paid' | 'pending';
    paid_on?: Date;
    payment_mode?: string;
}

// Expense types
export interface Expense {
    id: string;
    title: string;
    category: 'pooja' | 'electricity' | 'maintenance' | 'renovation' | 'misc';
    description?: string;
    amount: number;
    receipt_url?: string;
    expense_date: Date;
    created_by: string;
}

// Document types
export interface Document {
    id: string;
    title: string;
    category: string;
    file_url: string;
    uploaded_by: string;
    created_at: Date;
}

// Transaction types (Accounting Ledger)
export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    reference_id?: string;  // Link to contribution/expense
    created_by: string;
    created_at: Date;
}

// Audit Log types (Transparency)
export interface AuditLog {
    id: string;
    action: string;  // e.g., "created_expense", "updated_contribution"
    performed_by: string;
    entity_type: string;  // e.g., "expense", "contribution"
    entity_id: string;
    timestamp: Date;
}

// Auth context type
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}
