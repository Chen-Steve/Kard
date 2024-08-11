import { AxiosError} from 'axios';

export function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}