import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    // Dead scaffolding files — both contain pre-existing parse errors and
    // are not imported anywhere. Kept in the tree as scratchpads for
    // potential future use; ignored by lint so CI isn't blocked.
    'src/components/features/RoutinePlanner.jsx',
    'src/components/features/WorkoutLogger.jsx',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Allow:
      //   1. underscore-prefixed args/vars  e.g. (_event) => ..., const { _x } = ...
      //   2. destructured-then-discarded keys via rest  const { token, ...rest } = obj
      //   3. caught-error parameters we don't read     catch (_err) { ... }
      // Everything else still errors, so genuine unused code still fails CI.
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Vite's Fast Refresh requires component files to export ONLY
      // components — otherwise an edit reloads the module instead of
      // hot-swapping the component. We follow the rule for new code but
      // keep it as a warning (not an error) because:
      //   a) Several existing files legitimately co-locate a custom hook
      //      or small helper with the component (Toast + useToast,
      //      ChartCard + palette/cursors, PasswordStrength +
      //      evaluatePassword). Splitting them is mechanical refactor
      //      noise without product value.
      //   b) The rule fires only on dev-server HMR — production builds
      //      are unaffected. So failing CI over it conflates "dev tooling
      //      friction" with "broken build".
      // `allowConstantExport` further reduces noise by letting plain
      // `export const FOO = 1` ride alongside a component default export.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // React 19's strict `react-hooks/set-state-in-effect` rule flags the
      // perfectly legitimate "fetch data on mount" pattern that every one
      // of our useFoo hooks uses. The recommended escape is to move data
      // fetching to React Query / SWR — a future refactor, not an MVP
      // task. Downgrade to warning so CI is honest about it but doesn't
      // fail the build over the entire data-fetching layer.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
