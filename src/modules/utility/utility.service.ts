import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class UtilityService {
  /**
   * Generate random salt
   * @returns {string} the random generated salt
   */
  passwordSalt(): string {
    return bcrypt.genSaltSync(10);
  }

  /**
   * Hash password
   * @param {string} password the password from the body
   * @param {string} salt the generated salt
   * @returns {string} the hashed password
   */
  passwordHash(password: string, salt: string): string {
    return bcrypt.hashSync(password, salt);
  }

  /**
   * Compare password
   * @param {string} password the password from the body
   * @param {string} hashedPassword the password in the db
   * @returns {boolean}
   */
  passwordCompare(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  /**
   * Delete properties from object
   * @param {object} obj the object
   * @param {string[]} props the properties to delete
   * @returns {object} the object without the specified properties
   */
  deleteProps<T extends Record<string, unknown>>(
    obj: T,
    props: string[],
  ): Partial<T> {
    const result = { ...obj };
    props.forEach((prop) => {
      delete result[prop];
    });
    return result;
  }
}
