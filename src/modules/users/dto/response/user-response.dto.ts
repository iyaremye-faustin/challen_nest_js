import { Exclude } from 'class-transformer';
import { CountryAddress } from '../../../../constants/general';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  address: CountryAddress;
  account_verified: boolean;
  created_at: Date;
  updated_at: Date;
  role?: { id: string; name: string };
  /** Membership status within the organisation, distinct from the account `status`. */
  organisation_status?: string;

  @Exclude()
  password: string;

  @Exclude()
  salt: string;
}
