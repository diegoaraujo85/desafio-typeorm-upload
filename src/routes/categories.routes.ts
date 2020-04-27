import { Router } from 'express';
import { getRepository } from 'typeorm';
import Category from '../models/Category';

const categoriesRouter = Router();

categoriesRouter.get('/', async (request, response) => {
  const categoryRepository = getRepository(Category);
  const categories = await categoryRepository.find();

  return response.json({ categories });
});

export default categoriesRouter;
