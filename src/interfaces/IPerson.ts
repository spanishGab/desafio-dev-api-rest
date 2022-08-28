import { IAccount } from "../services/account";

export default interface IPerson {
  id: number;
  name: string;
  documentNumber: string;
  birthDate: Date;
}
