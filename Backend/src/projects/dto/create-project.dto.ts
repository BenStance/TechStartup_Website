export class CreateProjectDto {
  title: string;
  description: string;
  serviceId: number;
  clientId: number;
  controllerId?: number;
  progress?: number;
  amount?: number;
  amountDescription?: string;
}