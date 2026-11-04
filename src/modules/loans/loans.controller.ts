import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import {
  parsePagination,
  ApiPaginationQuery,
} from '../../helpers/pagination.helper';

@ApiTags('Loans')
@ApiBearerAuth('access-token')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully' })
  @ApiBody({ type: CreateLoanDto })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all loans' })
  @ApiResponse({ status: 200, description: 'List of loans' })
  @ApiPaginationQuery()
  findAll(@Query() query: { page?: string; limit?: string }) {
    return this.loansService.findAll(parsePagination(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a loan by ID' })
  @ApiResponse({ status: 200, description: 'Loan found' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a loan by ID' })
  @ApiResponse({ status: 200, description: 'Loan updated successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateLoanDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a loan by ID' })
  @ApiResponse({ status: 200, description: 'Loan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.remove(id);
  }
}
