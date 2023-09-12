export interface TokenResult {
  access_token: string;
  expires_in: number;
}

export interface VerifyBody {
  email: string;
  code: string;
}

export interface RecoverBody extends VerifyBody {
  password: string;
}
