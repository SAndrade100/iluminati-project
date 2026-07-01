import {
  Controller, Get, Post, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Public, CurrentUser, CurrentUserData } from '@app/auth-common';

@ApiTags('reviews')
@ApiBearerAuth('access-token')
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Avaliar produto (um por produto por usuário)' })
  @ApiResponse({ status: 201, description: 'Avaliação criada' })
  @ApiResponse({ status: 409, description: 'Produto já avaliado' })
  @Post('products/:id/reviews')
  createReview(
    @Param('id') productId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reviewService.create(productId, user.userId, dto);
  }

  @ApiOperation({ summary: 'Listar avaliações de um produto com média (público)' })
  @Public()
  @Get('products/:id/reviews')
  getProductReviews(@Param('id') productId: string) {
    return this.reviewService.findByProduct(productId);
  }

  @ApiOperation({ summary: 'Minhas avaliações' })
  @Get('reviews/mine')
  getMyReviews(@CurrentUser() user: CurrentUserData) {
    return this.reviewService.findByUser(user.userId);
  }

  @ApiOperation({ summary: 'Deletar avaliação (dono ou ADMIN)' })
  @ApiResponse({ status: 403, description: 'Não é o dono da avaliação' })
  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReview(@Param('reviewId') reviewId: string, @CurrentUser() user: CurrentUserData) {
    return this.reviewService.remove(reviewId, user.userId, user.role);
  }
}
