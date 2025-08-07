import { Language, Translations } from '../types';
import { ko } from './ko';
import { en } from './en';
import { ja } from './ja';
import { zh } from './zh';
import { es } from './es';

export const translations: Record<Language, Translations> = {
  ko,
  en,
  ja,
  zh,
  es,
};