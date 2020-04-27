import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError('No balance to include new outcome.');
    }
    // 1:01

    let categoryInDatabase = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryInDatabase) {
      categoryInDatabase = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryInDatabase);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryInDatabase.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
