import { parse as parseCsv } from 'csv-parse/sync';
import ExcelJS from 'exceljs';
import { logger } from './logger';

export type ParsedRecord = Record<string, unknown>;

function toExceljsBuffer(buffer: Buffer): Parameters<ExcelJS.Xlsx['load']>[0] {
  return buffer as unknown as Parameters<ExcelJS.Xlsx['load']>[0];
}

export interface ParsedExcelRow {
  /** 1-indexed row number as it appears in the spreadsheet (header is row 1). */
  row: number;
  values: ParsedRecord;
}

export interface ParsedExcelSheet {
  headers: string[];
  rows: ParsedExcelRow[];
}

export class FileHandler {
  constructor(
    public readonly fileName: string,
    private readonly buffer: Buffer,
  ) {}

  isCsv(): boolean {
    return /\.csv$/i.test(this.fileName);
  }

  isExcel(): boolean {
    return /\.xlsx?$/i.test(this.fileName);
  }

  parseCsv(): ParsedRecord[] {
    try {
      return parseCsv(this.buffer, {
        columns: true,
        delimiter: ',',
        trim: true,
        skip_empty_lines: true,
        bom: true,
        comment: '#',
        relax_column_count: true,
      });
    } catch (error) {
      logger.error(
        { error, fileName: this.fileName },
        'Failed to parse CSV content',
      );
      throw new Error('Failed parsing CSV content');
    }
  }

  countCsvRecords(): number {
    return this.parseCsv().length;
  }

  /** @param sheet Worksheet name or 1-indexed position; defaults to the first sheet. */
  async parseExcel(sheet: string | number = 1): Promise<ParsedExcelSheet> {
    let workbook: ExcelJS.Workbook;
    try {
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(toExceljsBuffer(this.buffer));
    } catch (error) {
      logger.error(
        { error, fileName: this.fileName },
        'Failed to load Excel workbook',
      );
      throw new Error('The file is not a valid Excel workbook');
    }

    const worksheet = workbook.getWorksheet(sheet);
    if (!worksheet) {
      throw new Error(
        typeof sheet === 'string'
          ? `Worksheet "${sheet}" not found in the Excel file`
          : 'Worksheet not found in the Excel file',
      );
    }

    const headers = this.extractHeaders(worksheet.getRow(1));

    const rows: ParsedExcelRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (row.actualCellCount === 0) return; // skip fully blank rows
      rows.push({ row: rowNumber, values: this.rowToRecord(row, headers) });
    });

    return { headers: [...headers.values()], rows };
  }

  async countExcelRecords(sheet: string | number = 1): Promise<number> {
    return (await this.parseExcel(sheet)).rows.length;
  }

  /** Column number (1-indexed, matching ExcelJS) -> header text. */
  private extractHeaders(headerRow: ExcelJS.Row): Map<number, string> {
    const headers = new Map<number, string>();
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = this.cellText(cell.value);
      if (header) headers.set(colNumber, header);
    });
    return headers;
  }

  private rowToRecord(
    row: ExcelJS.Row,
    headers: Map<number, string>,
  ): ParsedRecord {
    const record: ParsedRecord = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers.get(colNumber);
      if (header) record[header] = this.cellValue(cell.value);
    });
    return record;
  }

  private cellText(value: ExcelJS.CellValue): string {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    return '';
  }

  private cellValue(value: ExcelJS.CellValue): unknown {
    if (value && typeof value === 'object' && 'text' in value) {
      return (value as { text: unknown }).text;
    }
    return value;
  }
}
