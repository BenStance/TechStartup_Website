import { ProjectStatus } from '../../common/constants/project-status.constant';

export class Project {
  id: number;
  title: string;
  description: string;
  serviceId: number;
  clientId: number;
  controllerId?: number;
  status: ProjectStatus;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  amount?: number;
  amountDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}