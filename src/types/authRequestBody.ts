export interface RegisterRequestBody {
    email: string;
    username: string;
    password: string;
    country: string;
    city?: string;
    street?: string;
    creation_date?: Date;
  }
  
  export interface LoginRequestBody {
    email: string;
    password: string;
  }
  