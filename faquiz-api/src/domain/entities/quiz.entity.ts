export interface QuizEntity {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  rootNodeId: string | null;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}
