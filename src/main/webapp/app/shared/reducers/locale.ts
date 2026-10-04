import { TranslatorContext } from 'react-jhipster';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const initialState = {
  currentLocale: '',
  lastChange: TranslatorContext.context.lastChange,
  loadedKeys: [] as string[],
};

export type LocaleState = Readonly<typeof initialState>;

const registeredLocales = new Map<string, Promise<void>>();

/**
 * Registers the translations bundled with this application for the locale.
 * Defaults to the locale of the (shared) translator context, so a microfrontend registers its translations
 * for the locale of the host application.
 * The pending registration is memoized, so concurrent callers await the same registration instead of resolving early.
 */
export const registerTranslations = (
  locale = TranslatorContext.context.locale || TranslatorContext.context.defaultLocale,
): Promise<void> => {
  if (!locale) return Promise.resolve();
  let registration = registeredLocales.get(locale);
  if (!registration) {
    registration = import(`../../../i18n/${locale}/${locale}.js`).then(
      translations => {
        TranslatorContext.registerTranslations(locale, translations.default);
      },
      error => {
        // Allow retrying if the translations could not be loaded.
        registeredLocales.delete(locale);
        throw error;
      },
    );
    registeredLocales.set(locale, registration);
  }
  return registration;
};

export const setLocale = createAsyncThunk('locale/setLocale', async (locale: string, thunkAPI: any) => {
  const { loadedKeys } = thunkAPI.getState().locale;
  if (!loadedKeys.includes(locale)) {
    await registerTranslations(locale);
    thunkAPI.dispatch(loaded({ keys: [locale] }));
  }
  thunkAPI.dispatch(updateLocale(locale));
  return locale;
});

/**
 * Registers the translations bundled with this microfrontend into the host application.
 * Translations are merged into the host locale, the source prefix keeps track of what was already registered.
 */
export const addTranslationSourcePrefix = createAsyncThunk(
  'locale/addTranslationSourcePrefix',
  async (sourcePrefix: string, thunkAPI: any) => {
    const { currentLocale, loadedKeys } = thunkAPI.getState().locale;
    const key = `${sourcePrefix}${currentLocale}`;
    if (currentLocale && !loadedKeys.includes(key)) {
      await registerTranslations(currentLocale);
      thunkAPI.dispatch(loaded({ keys: [key] }));
    }
    return key;
  },
);

export const LocaleSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    updateLocale(state, action) {
      const currentLocale = action.payload;
      if (state.currentLocale !== currentLocale) {
        dayjs.locale(currentLocale);
        TranslatorContext.setLocale(currentLocale);
      }
      state.currentLocale = currentLocale;
    },
    loaded(state, action) {
      const { keys } = action.payload;
      if (keys) {
        state.loadedKeys = state.loadedKeys.concat(keys);
      }
      state.lastChange = TranslatorContext.context.lastChange;
    },
  },
});

export const { updateLocale, loaded } = LocaleSlice.actions;

// Reducer
export default LocaleSlice.reducer;
