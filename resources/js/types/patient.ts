export interface Patient {
    hrns: PatientHrn[];
    id: number;
    hrn: string;
    firstname: string;
    middlename: string | null;
    lastname: string;
    records_count: number;
}

export interface Props {
    patients: Patient[];
    filters: any;
}

export interface PatientHrn {
    id: number;
    hrn: string;
    is_primary: number;
}