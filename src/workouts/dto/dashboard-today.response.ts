export type DashboardTodayResponse =
  | {
      mode: "active";
      workoutId: string;
      trainingId: string;
      trainingName: string;
      exerciseCount: number;
      isActive: true;
    }
  | {
      mode: "next";
      trainingId: string;
      trainingName: string;
      exerciseCount: number;
      isActive: false;
    }
  | {
      mode: "empty";
      isActive: false;
    };
