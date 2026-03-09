export interface DayHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface RecruiterSettings {
  timezone: string;
  defaultInterviewDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  hoursByDay: Record<string, DayHours>;
  calendarConnections: {
    google: boolean;
    outlook: boolean;
  };
}
