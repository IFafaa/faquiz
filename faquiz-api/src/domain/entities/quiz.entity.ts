export interface QuizEntity {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  rootNodeId: string | null;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}
