import React, { useEffect } from 'react';
import { Translate } from 'react-jhipster'; // eslint-disable-line

import { useAppDispatch, useAppSelector } from 'app/config/store';
import MenuItem from 'app/shared/layout/menus/menu-item'; // eslint-disable-line
import { addTranslationSourcePrefix, registerTranslations } from 'app/shared/reducers/locale';

// Register the microfrontend translations before the menu is rendered by the host application.
await registerTranslations();

const EntitiesMenu = () => {
  const currentLocale = useAppSelector(state => state.locale.currentLocale);
  const dispatch = useAppDispatch();
  useEffect(() => {
    // Register the microfrontend translations into the host for the current locale.
    dispatch(addTranslationSourcePrefix('jhipsterapp/'));
  }, [currentLocale]);

  return (
    <>
      {/* prettier-ignore */}
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;
