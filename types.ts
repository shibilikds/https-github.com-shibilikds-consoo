export interface TeamResult {
    id: string;
    name: string;
    points: number;
    campus: string;
}

export interface NewsItem {
    id: string;
    title: string;
    category: 'Events' | 'Partnership' | 'Workshop' | 'General';
    description: string;
    imageUrl: string;
    date: string;
}

export interface FestivalStats {
    daysLeft: number;
    totalEvents: number;
    totalCompetitors: number;
}
