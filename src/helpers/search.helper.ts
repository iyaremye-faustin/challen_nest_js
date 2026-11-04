import { Op, WhereAttributeHash } from 'sequelize';

function escapeLike(value: string): string {
  return value.replaceAll(/[\\%_]/g, (char) => `\\${char}`);
}

export function nameSearch(search?: string): WhereAttributeHash {
  const term = search?.trim();
  return term ? { name: { [Op.iLike]: `%${escapeLike(term)}%` } } : {};
}

export function columnsSearch(
  search: string | undefined,
  columns: string[],
): WhereAttributeHash {
  const term = search?.trim();
  if (!term) return {};

  const match = { [Op.iLike]: `%${escapeLike(term)}%` };
  return { [Op.or]: columns.map((column) => ({ [column]: match })) };
}
