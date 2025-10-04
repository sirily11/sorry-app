# Internationalization (i18n) Setup

This application now supports multiple languages using `i18next` and `react-i18next`.

## Supported Languages

- **English** (en) - Default
- **Chinese Simplified** (zh-CN)

## Architecture

The i18n implementation uses:
- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- Custom provider pattern for Next.js App Router

## File Structure

```
sorry-app/
├── public/
│   └── locales/
│       ├── en/
│       │   └── common.json          # English translations
│       └── zh-CN/
│           └── common.json          # Chinese Simplified translations
├── src/
│   ├── lib/
│   │   └── i18n.ts                  # i18next configuration
│   └── components/
│       ├── i18n-provider.tsx        # React context provider
│       └── language-switcher.tsx    # Language selector UI
```

## How It Works

### 1. Translation Files

Translation keys are organized hierarchically in JSON files:

```json
{
  "app_title": "The Sorry App",
  "form": {
    "label": "What went wrong?",
    "button_generate": "Generate Apology"
  }
}
```

### 2. i18n Configuration

The `src/lib/i18n.ts` file initializes i18next with:
- Translation resources
- Default language (English)
- Fallback language
- React integration settings

### 3. Provider Setup

The `I18nProvider` component wraps the entire application in `src/app/layout.tsx`:
- Initializes i18next on client side
- Persists language selection to localStorage
- Handles language changes

### 4. Using Translations in Components

Import the `useTranslation` hook in any client component:

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('app_title')}</h1>;
}
```

### 5. Language Switcher

The `LanguageSwitcher` component provides a UI for users to change languages:
- Displays a globe icon with current language flag
- Shows dropdown with available languages
- Persists selection to localStorage
- Triggers immediate UI updates

## Adding New Languages

To add a new language:

1. Create a new directory under `public/locales/` (e.g., `public/locales/es/`)
2. Add `common.json` with all translation keys
3. Update `src/lib/i18n.ts` to import and register the new language
4. Add the language option to `LanguageSwitcher` component

## Adding New Translation Keys

When adding new text to the UI:

1. Add the key to `public/locales/en/common.json`
2. Add the corresponding translation to all other language files
3. Use the translation key in your component with `t('your.key')`

## Language Persistence

The selected language is automatically saved to `localStorage` and restored on subsequent visits.

## Testing

A test script is available to verify translation parity:

```bash
node /tmp/test-i18n.js
```

This checks:
- Translation files exist
- All languages have the same keys
- Sample translations are correct
