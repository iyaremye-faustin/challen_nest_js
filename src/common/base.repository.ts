import {
  Model,
  WhereOptions,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  ModelStatic,
  Order,
} from 'sequelize';

function calculateOffset(
  page: number | undefined,
  limit: number | undefined,
): number {
  if (page && limit) {
    return (page - 1) * limit;
  }
  return 0;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  orderBy?: Order;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  /**
   * Create a new record
   * @param data - The data to create the record with
   * @param options - Creation options
   * @returns The created record
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any, options?: CreateOptions): Promise<T> {
    return this.model.create(data, options);
  }

  async findById(
    id: string | number,
    options?: FindOptions,
  ): Promise<T | null> {
    return this.model.findByPk(id, options);
  }

  async findOne(where: WhereOptions, options?: FindOptions): Promise<T | null> {
    return this.model.findOne({ where, ...options });
  }

  async findAll(
    filter?: WhereOptions,
    pagination?: PaginationOptions,
    sort?: SortOptions,
    additionalOptions?: Omit<
      FindOptions,
      'where' | 'order' | 'limit' | 'offset'
    >,
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, offset } = pagination || {};

    const calculatedOffset = offset ?? calculateOffset(page, limit);

    const options: FindOptions = {
      where: filter,
      ...(limit && { limit }),
      ...(calculatedOffset !== undefined && { offset: calculatedOffset }),
      ...(sort?.orderBy && { order: sort.orderBy }),
      ...additionalOptions,
    };

    const [data, total] = await Promise.all([
      this.model.findAll(options),
      this.model.count({ where: filter }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update a record by ID
   * @param id - The ID of the record to update
   * @param data - The data to update the record with
   * @param options - Update options
   * @returns The number of affected rows and the updated records
   */

  async update(
    id: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    options?: Omit<UpdateOptions, 'where'>,
  ): Promise<[number, T[]]> {
    return this.model.update(data, {
      where: { id } as WhereOptions,
      ...options,
      returning: true,
    });
  }

  async delete(id: string | number, options?: DestroyOptions): Promise<number> {
    return this.model.destroy({
      where: { id },
      ...options,
    });
  }

  async count(where?: WhereOptions): Promise<number> {
    return this.model.count({ where });
  }

  async exists(where: WhereOptions): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }
}
