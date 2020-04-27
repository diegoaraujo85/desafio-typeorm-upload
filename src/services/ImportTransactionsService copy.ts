import path from 'path';
import csvtojson from 'csvtojson';
import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
// import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';

import uploadConfig from '../config/upload';

class ImportTransactionsService {
  async execute(transactionsFilename: string): Promise<Transaction[]> {
    const transactionsFilePath = path.join(
      uploadConfig.directory,
      transactionsFilename,
    );

    const transactions = await csvtojson().fromFile(transactionsFilePath);
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const createdTransactions = await Promise.all(
      transactions.map(async transaction => {
        const { title, type, value, category } = transaction;

        // if (type === 'outcome') {
        //   const balance = await transactionRepository.getBalance();
        //   if (balance.total < value)
        //     throw new AppError('No balance to include new outcome.');
        // }

        let categoryInDatabase = await categoryRepository.findOne({
          where: { title: category },
        });

        if (!categoryInDatabase) {
          categoryInDatabase = categoryRepository.create({
            title: category,
          });
        }
        await categoryRepository.save(categoryInDatabase);

        const createdTransaction = transactionRepository.create({
          title,
          value,
          type,
          category_id: categoryInDatabase.id,
        });

        return createdTransaction;
      }),
    );

    await transactionRepository.save(createdTransactions);
    return createdTransactions;
  }
}

export default ImportTransactionsService;
